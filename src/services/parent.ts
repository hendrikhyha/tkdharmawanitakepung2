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
    theme: string;
    sub_theme: string | null;
    description: string | null;
    activity_date: string;
    activity_time: string | null;
    activity_photos: Array<{ id: string; image_url: string }>;
    activity_student_progress?: Array<{ student_id: string; notes: string; photo_url?: string | null }>;
  }>;
  totalPhotos: number;
}

export async function getParentDashboardData(
  userId: string,
  selectedChildId?: string | null
): Promise<ParentDashboardData | null> {
  const supabase = await createClient();

  // 1. Get Parent ID
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!parent) return null;

  // 2. Get Children via student_parents junction table
  const { data: studentParentLinks } = await supabase
    .from("student_parents")
    .select("student_id")
    .eq("parent_id", parent.id);

  const childStudentIds = (studentParentLinks || []).map((sp) => sp.student_id);

  if (childStudentIds.length === 0) {
    return { children: [], recentActivities: [], totalPhotos: 0 };
  }

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
    .in("id", childStudentIds);

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

  // 3. Determine which children to filter by
  const filterChildIds = selectedChildId
    ? childStudentIds.filter((id) => id === selectedChildId)
    : childStudentIds;

  // Get class_ids for filtered children
  const { data: studentClassIds } = await supabase
    .from("students")
    .select("class_id")
    .in("id", filterChildIds);

  const uniqueClassIds = [...new Set((studentClassIds || []).map((s) => s.class_id).filter(Boolean))] as string[];

  // 4. Get Recent Published Activities for those classes
  let recentActivities: ParentDashboardData["recentActivities"] = [];

  if (uniqueClassIds.length > 0) {
    const { data: activities } = await supabase
      .from("activities")
      .select(`
        id,
        theme,
        sub_theme,
        description,
        activity_date,
        activity_time,
        activity_photos (
          id,
          image_url
        ),
        activity_student_progress (
          student_id,
          notes,
          photo_url
        )
      `)
      .in("class_id", uniqueClassIds)
      .eq("status", "PUBLISHED")
      .order("activity_date", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(10);

    // Filter progress to only include the parent's children
    recentActivities = ((activities as any) || []).map((act: any) => ({
      ...act,
      activity_student_progress: act.activity_student_progress?.filter((p: any) =>
        filterChildIds.includes(p.student_id)
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

/**
 * Get children for a parent user using the student_parents junction table.
 * Used by attendance, gallery, progress pages.
 */
export async function getParentChildren(userId: string): Promise<ChildInfo[]> {
  const supabase = await createClient();

  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!parent) return [];

  const { data: studentParentLinks } = await supabase
    .from("student_parents")
    .select("student_id")
    .eq("parent_id", parent.id);

  const childStudentIds = (studentParentLinks || []).map((sp) => sp.student_id);

  if (childStudentIds.length === 0) return [];

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
    .in("id", childStudentIds);

  interface RawChild {
    id: string;
    name: string;
    birth_date: string | null;
    classes?: { name: string } | null;
  }

  return ((childrenRaw as unknown as RawChild[]) || []).map((c) => ({
    id: c.id,
    name: c.name,
    birth_date: c.birth_date,
    className: c.classes?.name || null,
  }));
}
