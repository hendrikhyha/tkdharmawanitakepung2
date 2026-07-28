"use server";

import { getReportData, ReportData } from "@/services/reports";
import { createClient } from "@/utils/supabase/server";

export async function fetchReportData(
  type: "daily" | "weekly" | "monthly",
  dateStr: string,
  studentId?: string | "ALL"
): Promise<{ data?: ReportData; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const reportData = await getReportData(user.id, type, dateStr, studentId);

    if (!reportData) return { error: "Data guru atau kelas tidak ditemukan" };

    return { data: reportData };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function fetchTeacherStudents(): Promise<{ data?: { id: string, name: string }[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!teacher) return { error: "Teacher not found" };

    const { data: classData } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", teacher.id)
      .single();

    if (!classData) return { error: "Class not found" };

    const { data: students } = await supabase
      .from("students")
      .select("id, name")
      .eq("class_id", classData.id)
      .order("name", { ascending: true });

    return { data: students || [] };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
