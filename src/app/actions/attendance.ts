"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper to get current teacher details
async function getTeacherContext(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (teacherError || !teacher) throw new Error("Teacher profile not found");

  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", teacher.id)
    .limit(1)
    .single();

  if (classError || !classData) throw new Error("No class assigned to this teacher");

  return { teacherId: teacher.id, classId: classData.id };
}

export type AttendanceEntry = {
  student_id: string;
  status: "PRESENT" | "SICK" | "EXCUSED" | "ABSENT";
  note?: string;
};

export async function saveDailyAttendance(date: string, entries: AttendanceEntry[]) {
  try {
    const supabase = await createClient();
    const { teacherId, classId } = await getTeacherContext(supabase);

    if (!date) {
      return { error: "Tanggal absensi tidak valid" };
    }

    if (!entries || entries.length === 0) {
      return { error: "Data absensi kosong" };
    }

    // Prepare data for upsert
    const recordsToUpsert = entries.map(entry => ({
      class_id: classId,
      student_id: entry.student_id,
      teacher_id: teacherId,
      date: date,
      status: entry.status,
      note: entry.note || null,
    }));

    // Perform upsert (Insert or Update if exists, based on unique constraint on student_id, date)
    const { error } = await supabase
      .from("attendances")
      .upsert(recordsToUpsert, {
        onConflict: 'student_id, date',
        ignoreDuplicates: false,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/teacher/attendance");
    revalidatePath("/teacher/reports/attendance");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
