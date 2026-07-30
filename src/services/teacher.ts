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
    .or(`teacher_id.eq.${teacherId},assistant_teacher_id.eq.${teacherId}`)
    .limit(1)
    .maybeSingle();

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

  // Total activities for class or teacher
  let totalActivitiesQuery = supabase.from("activities").select("*", { count: "exact", head: true });
  let todayActivitiesCountQuery = supabase.from("activities").select("*", { count: "exact", head: true }).eq("activity_date", today);
  let todayActivitiesListQuery = supabase.from("activities").select("id, title, activity_time, status").eq("activity_date", today);

  if (classData) {
    totalActivitiesQuery = totalActivitiesQuery.eq("class_id", classData.id);
    todayActivitiesCountQuery = todayActivitiesCountQuery.eq("class_id", classData.id);
    todayActivitiesListQuery = todayActivitiesListQuery.eq("class_id", classData.id);
  } else {
    totalActivitiesQuery = totalActivitiesQuery.eq("teacher_id", teacherId);
    todayActivitiesCountQuery = todayActivitiesCountQuery.eq("teacher_id", teacherId);
    todayActivitiesListQuery = todayActivitiesListQuery.eq("teacher_id", teacherId);
  }

  const [{ count: totalActivities }, { count: todayActivitiesCount }, { data: todayActivities }] = await Promise.all([
    totalActivitiesQuery,
    todayActivitiesCountQuery,
    todayActivitiesListQuery.order("activity_time", { ascending: true }).limit(5),
  ]);

  return {
    classInfo: classData ? { ...classData, studentCount } : null,
    activitiesCount: {
      total: totalActivities || 0,
      today: todayActivitiesCount || 0,
    },
    todayActivities: todayActivities || [],
  };
}
