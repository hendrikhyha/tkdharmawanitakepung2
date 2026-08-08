import { createClient } from "@/utils/supabase/server";

export interface TeacherNotification {
  id: string;
  title: string;
  message: string;
  actionUrl: string;
  actionText: string;
  isDismissible: boolean;
}

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
  notifications: TeacherNotification[];
}

export async function getTeacherNotifications(userId: string): Promise<TeacherNotification[]> {
  const supabase = await createClient();
  const notifications: TeacherNotification[] = [];
  const dayOfWeek = new Date().getDay(); // 0 is Sunday
  
  if (dayOfWeek === 0) return notifications; // No notifications on Sunday

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!teacher) return notifications;
  const teacherId = teacher.id;

  const { data: classData } = await supabase
    .from("classes")
    .select("id")
    .or(`teacher_id.eq.${teacherId},assistant_teacher_id.eq.${teacherId}`)
    .limit(1)
    .maybeSingle();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get strict setting
  const { data: settingData } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "strict_notifications")
    .maybeSingle();
    
  const isStrict = settingData?.value ?? true;
  const isDismissible = !isStrict;

  // Check missing attendance
  if (classData) {
    const { count: attendanceCount } = await supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classData.id)
      .eq("date", today);
      
    if (attendanceCount === 0) {
      notifications.push({
        id: "missing_attendance",
        title: "Absensi Belum Diisi",
        message: "Anda belum mengisi absensi siswa untuk hari ini.",
        actionUrl: "/teacher/attendance",
        actionText: "Isi Absensi",
        isDismissible
      });
    }
  }

  // Check missing activities
  let todayActivitiesCountQuery = supabase.from("activities").select("*", { count: "exact", head: true }).eq("activity_date", today);
  if (classData) {
    todayActivitiesCountQuery = todayActivitiesCountQuery.eq("class_id", classData.id);
  } else {
    todayActivitiesCountQuery = todayActivitiesCountQuery.eq("teacher_id", teacherId);
  }

  const { count: todayActivitiesCount } = await todayActivitiesCountQuery;

  if (todayActivitiesCount === 0) {
    notifications.push({
      id: "missing_activity",
      title: "Jurnal Kegiatan Kosong",
      message: "Anda belum membuat jurnal kegiatan harian untuk hari ini.",
      actionUrl: "/teacher/activities/new",
      actionText: "Buat Kegiatan",
      isDismissible
    });
  }

  return notifications;
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

  const notifications = await getTeacherNotifications(userId);

  return {
    classInfo: classData ? { ...classData, studentCount } : null,
    activitiesCount: {
      total: totalActivities || 0,
      today: todayActivitiesCount || 0,
    },
    todayActivities: todayActivities || [],
    notifications,
  };
}
