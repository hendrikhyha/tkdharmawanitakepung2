import { createClient } from "@/utils/supabase/server";

export interface ReportPhoto {
  id: string;
  image_url: string;
}

export interface ReportActivity {
  id: string;
  theme: string;
  sub_theme: string | null;
  description: string | null;
  activity_date: string;
  activity_time: string | null;
  status: string;
  activity_photos: ReportPhoto[];
  activity_student_progress?: Array<{
    notes: string;
    students: { id: string; name: string } | { id: string; name: string }[];
  }>;
}

export interface ReportData {
  teacherName: string;
  className: string;
  academicYear: string;
  activities: ReportActivity[];
  period: string;
  studentName?: string;
}

export async function getReportData(
  userId: string,
  type: "daily" | "weekly" | "monthly",
  dateStr: string,
  studentId?: string | "ALL"
): Promise<ReportData | null> {
  const supabase = await createClient();

  // Get teacher
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, users(name)")
    .eq("user_id", userId)
    .single();

  if (!teacher) return null;

  // Get class
  const { data: classData } = await supabase
    .from("classes")
    .select("id, name, academic_years(name)")
    .eq("teacher_id", teacher.id)
    .single();

  if (!classData) return null;

  // Calculate date range
  const baseDate = new Date(dateStr);
  let startDate: string;
  let endDate: string;
  let period: string;

  if (type === "daily") {
    startDate = dateStr;
    endDate = dateStr;
    period = dateStr;
  } else if (type === "weekly") {
    const dayOfWeek = baseDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    startDate = monday.toISOString().split("T")[0];
    endDate = sunday.toISOString().split("T")[0];
    period = `${startDate} — ${endDate}`;
  } else {
    // monthly
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    startDate = firstDay.toISOString().split("T")[0];
    endDate = lastDay.toISOString().split("T")[0];
    period = `${startDate} — ${endDate}`;
  }

  // Query activities with activity_photos
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      theme,
      sub_theme,
      description,
      activity_date,
      activity_time,
      status,
      activity_photos (
        id,
        image_url
      ),
      activity_student_progress (
        notes,
        students (
          id,
          name
        )
      )
    `)
    .eq("teacher_id", teacher.id)
    .gte("activity_date", startDate)
    .lte("activity_date", endDate)
    .order("activity_date", { ascending: true })
    .order("sort_order", { ascending: true });

  let filteredActivities = (activities as unknown as ReportActivity[]) || [];
  let studentNameTarget = undefined;

  if (studentId && studentId !== "ALL") {
    // Determine the student's name from one of the activities (or we could fetch it separately)
    // To be safe, fetch it separately:
    const { data: stData } = await supabase.from("students").select("name").eq("id", studentId).single();
    if (stData) {
      studentNameTarget = stData.name;
    }

    // Filter the activities to only include the selected student's progress
    filteredActivities = filteredActivities.map(act => {
      if (!act.activity_student_progress) return act;
      const filteredProgress = act.activity_student_progress.filter(p => {
        const sid = Array.isArray(p.students) ? p.students[0]?.id : (p.students as any)?.id;
        return sid === studentId;
      });
      return {
        ...act,
        activity_student_progress: filteredProgress,
      };
    });
  }

  const teacherObj = teacher as unknown as { users?: { name: string } | { name: string }[] };
  const teacherName = Array.isArray(teacherObj.users)
    ? teacherObj.users[0]?.name
    : teacherObj.users?.name;

  const classObj = classData as unknown as { academic_years?: { name: string } | { name: string }[] };
  const academicYear = Array.isArray(classObj.academic_years)
    ? classObj.academic_years[0]?.name
    : classObj.academic_years?.name;

  return {
    teacherName: teacherName || "Guru",
    className: classData.name,
    academicYear: academicYear || "-",
    activities: filteredActivities,
    period,
    studentName: studentNameTarget,
  };
}

