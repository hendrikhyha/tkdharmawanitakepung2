"use server";

import { createClient } from "@/utils/supabase/server";

export interface StudentProgressData {
  id?: string;
  student_id: string;
  activity_id: string;
  notes: string;
}

export async function getStudentProgress(activityId: string) {
  try {
    const supabase = await createClient();

    // First, verify the activity exists and get its class_id
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("class_id")
      .eq("id", activityId)
      .single();

    if (activityError || !activity) {
      return { error: "Aktivitas tidak ditemukan" };
    }

    // Next, get all students in this class
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, name, photo")
      .eq("class_id", activity.class_id)
      .order("name", { ascending: true });

    if (studentsError) {
      return { error: studentsError.message };
    }

    // Next, get the existing progress for this activity
    const { data: progress, error: progressError } = await supabase
      .from("activity_student_progress")
      .select("*")
      .eq("activity_id", activityId);

    if (progressError) {
      return { error: progressError.message };
    }

    // Combine them
    const result = students.map((student: any) => {
      const studentProgress = progress?.find((p: any) => p.student_id === student.id);
      return {
        student,
        progress: studentProgress || null,
      };
    });

    return { success: true, data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function saveStudentProgress(
  activityId: string,
  progressData: { student_id: string; notes: string }[]
) {
  try {
    const supabase = await createClient();

    const upsertData = progressData.map((data) => ({
      activity_id: activityId,
      student_id: data.student_id,
      notes: data.notes,
    }));

    // Upsert into activity_student_progress (relies on UNIQUE constraint for conflict resolution)
    const { error } = await supabase
      .from("activity_student_progress")
      .upsert(upsertData, {
        onConflict: "activity_id,student_id",
      });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
