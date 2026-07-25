import { createClient } from "@/utils/supabase/server";

export interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  totalClasses: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [teachers, students, parents, classes] = await Promise.all([
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("parents").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalTeachers: teachers.count ?? 0,
    totalStudents: students.count ?? 0,
    totalParents: parents.count ?? 0,
    totalClasses: classes.count ?? 0,
  };
}
