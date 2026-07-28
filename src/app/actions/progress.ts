"use server";

import { createClient } from "@/utils/supabase/server";

export interface StudentProgressData {
  id?: string;
  student_id: string;
  activity_id: string;
  notes: string;
  photo_url?: string | null;
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

export async function saveStudentProgress(formData: FormData) {
  try {
    const supabase = await createClient();
    const activityId = formData.get("activityId") as string;
    
    // Parse student data from formData keys
    // Format: "notes_STUDENTID", "photo_STUDENTID"
    const studentData: Record<string, { notes: string; photo_url?: string | null }> = {};
    const existingPhotoUrls: Record<string, string | null> = {};

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("notes_")) {
        const studentId = key.replace("notes_", "");
        if (!studentData[studentId]) studentData[studentId] = { notes: "" };
        studentData[studentId].notes = value as string;
      } else if (key.startsWith("existing_photo_")) {
        const studentId = key.replace("existing_photo_", "");
        existingPhotoUrls[studentId] = value as string;
      }
    }

    // Process photo uploads
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo_") && value instanceof File && value.size > 0) {
        const studentId = key.replace("photo_", "");
        
        // Generate a unique path for the photo
        const fileExt = value.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `progress/${activityId}/${studentId}/${fileName}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error: uploadError } = await supabase.storage
          .from("activities")
          .upload(filePath, buffer, {
            contentType: value.type,
            upsert: true,
          });

        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage
            .from("activities")
            .getPublicUrl(data.path);
          
          if (!studentData[studentId]) studentData[studentId] = { notes: "" };
          studentData[studentId].photo_url = publicUrlData.publicUrl;
        }
      }
    }

    const upsertData = Object.entries(studentData).map(([student_id, data]) => ({
      activity_id: activityId,
      student_id,
      notes: data.notes,
      photo_url: data.photo_url !== undefined ? data.photo_url : (existingPhotoUrls[student_id] || null),
    }));

    if (upsertData.length === 0) return { success: true };

    // Upsert into activity_student_progress
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
