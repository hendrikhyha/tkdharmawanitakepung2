import { createClient } from "@/utils/supabase/server";

export interface ChildInfo {
  id: string;
  name: string;
  birth_date: string | null;
  className: string | null;
}

export interface ParentDashboardData {
  children: ChildInfo[];
  recentActivities: Array<{
    id: string;
    title: string;
    description: string | null;
    activity_date: string;
    activity_time: string | null;
    activity_photos: Array<{ id: string; image_url: string }>;
    activity_student_progress?: Array<{ student_id: string; notes: string }>;
  }>;
  totalPhotos: number;
}

export async function getParentDashboardData(userId: string): Promise<ParentDashboardData | null> {
  const supabase = await createClient();

  // 1. Get Parent ID
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!parent) return null;

  // 2. Get Children Info
  const { data: childrenRaw } = await supabase
    .from("students")
    .select(`
      id,
      name,
      birth_date,
      classes (
        name
      )
    `)
    .eq("parent_id", parent.id);

  interface RawChild {
    id: string;
    name: string;
    birth_date: string | null;
    classes?: { name: string } | null;
  }

  const children: ChildInfo[] = ((childrenRaw as unknown as RawChild[]) || []).map((c) => ({
    id: c.id,
    name: c.name,
    birth_date: c.birth_date,
    className: c.classes?.name || null,
  }));



  // Actually, let's re-fetch class_ids properly
  const { data: studentClassIds } = await supabase
    .from("students")
    .select("class_id")
    .eq("parent_id", parent.id);

  const uniqueClassIds = [...new Set((studentClassIds || []).map((s) => s.class_id).filter(Boolean))] as string[];

  // 4. Get Recent Published Activities for those classes
  let recentActivities: ParentDashboardData["recentActivities"] = [];

  if (uniqueClassIds.length > 0) {
    const { data: activities } = await supabase
      .from("activities")
      .select(`
        id,
        title,
        description,
        activity_date,
        activity_time,
        activity_photos (
          id,
          image_url
        ),
        activity_student_progress (
          student_id,
          notes
        )
      `)
      .in("class_id", uniqueClassIds)
      .eq("status", "PUBLISHED")
      .order("activity_date", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(10);

    const childrenIds = children.map((c) => c.id);

    // Filter progress to only include the parent's children
    recentActivities = ((activities as any) || []).map((act: any) => ({
      ...act,
      activity_student_progress: act.activity_student_progress?.filter((p: any) =>
        childrenIds.includes(p.student_id)
      ),
    }));
  }

  // 5. Count total photos
  let totalPhotos = 0;
  for (const act of recentActivities) {
    totalPhotos += act.activity_photos?.length || 0;
  }

  return {
    children,
    recentActivities,
    totalPhotos,
  };
}
