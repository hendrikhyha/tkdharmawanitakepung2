import { createClient } from "@/utils/supabase/server";

export interface TeacherDashboardStats {
  classInfo: {
    id: string;
    name: string;
    studentCount: number;
  } | null;
  activitiesCount: {
    total: number;
    today: number;
  };
  todayActivities: Array<{
    id: string;
    title: string;
    activity_time: string | null;
    status: string;
  }>;
}

export async function getTeacherDashboardStats(userId: string): Promise<TeacherDashboardStats | null> {
  const supabase = await createClient();

  // 1. Get Teacher ID from User ID
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!teacher) return null;
  const teacherId = teacher.id;

  // 2. Get Class Info & Student Count
  const { data: classData } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .single();

  let studentCount = 0;
  if (classData) {
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classData.id);
    studentCount = count || 0;
  }

  // 3. Get Activities Stats
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Total activities
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", teacherId);

  // Today activities count
  const { count: todayActivitiesCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .eq("activity_date", today);

  // Today's activities list
  const { data: todayActivities } = await supabase
    .from("activities")
    .select("id, title, activity_time, status")
    .eq("teacher_id", teacherId)
    .eq("activity_date", today)
    .order("activity_time", { ascending: true })
    .limit(5);

  return {
    classInfo: classData ? { ...classData, studentCount } : null,
    activitiesCount: {
      total: totalActivities || 0,
      today: todayActivitiesCount || 0,
    },
    todayActivities: todayActivities || [],
  };
}
