import { createClient } from "@/utils/supabase/server";

export interface ReportPhoto {
  id: string;
  image_url: string;
}

export interface ReportActivity {
  id: string;
  title: string;
  description: string | null;
  activity_date: string;
  activity_time: string | null;
  status: string;
  activity_photos: ReportPhoto[];
}

export interface ReportData {
  teacherName: string;
  className: string;
  academicYear: string;
  activities: ReportActivity[];
  period: string;
}

export async function getReportData(
  userId: string,
  type: "daily" | "weekly" | "monthly",
  dateStr: string
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
      title,
      description,
      activity_date,
      activity_time,
      status,
      activity_photos (
        id,
        image_url
      )
    `)
    .eq("teacher_id", teacher.id)
    .gte("activity_date", startDate)
    .lte("activity_date", endDate)
    .order("activity_date", { ascending: true })
    .order("sort_order", { ascending: true });

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
    activities: (activities as unknown as ReportActivity[]) || [],
    period,
  };
}

