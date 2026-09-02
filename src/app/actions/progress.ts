"use server";

import { createClient } from "@/utils/supabase/server";

export interface ProgressItem {
  notes: string;
  photo_url?: string | null;
}

export interface StudentProgressData {
  id?: string;
  student_id: string;
  activity_id: string;
  items: ProgressItem[];
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
  // We can skip updating this if it's unused, but it's better to refactor if needed.
  // Actually, saveSingleStudentProgress is what's actively used for 5 slots per student.
  // We'll leave saveStudentProgress unimplemented or error out if not used, 
  // or just skip modifying it because ProgressForm only uses saveSingleStudentProgress.
  return { error: "Not implemented for multi-slot" };
}

export async function saveSingleStudentProgress(formData: FormData) {
  try {
    const supabase = await createClient();
    const activityId = formData.get("activityId") as string;
    const studentId = formData.get("studentId") as string;
    
    // We expect notes_0, notes_1, ..., notes_4 and photo_0, photo_1, ..., photo_4
    const items: ProgressItem[] = [];
    
    for (let i = 0; i < 5; i++) {
      const notes = formData.get(`notes_${i}`) as string | null;
      const photo = formData.get(`photo_${i}`) as File | null;
      const existingPhotoUrl = formData.get(`existing_photo_${i}`) as string | null;
      
      let finalPhotoUrl = existingPhotoUrl || null;
      
      if (photo && photo.size > 0) {
        // Process photo upload
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `progress/${activityId}/${studentId}/${fileName}`;

        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error: uploadError } = await supabase.storage
          .from("activities")
          .upload(filePath, buffer, {
            contentType: photo.type,
            upsert: true,
          });

        if (uploadError) {
          return { error: `Gagal mengunggah foto slot ${i + 1}: ${uploadError.message}` };
        }

        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from("activities")
            .getPublicUrl(data.path);
          
          finalPhotoUrl = publicUrlData.publicUrl;
        }
      }
      
      // Only add to items if there's notes or a photo
      if ((notes && notes.trim() !== "") || finalPhotoUrl) {
        items.push({
          notes: notes || "",
          photo_url: finalPhotoUrl
        });
      }
    }

    const { error } = await supabase
      .from("activity_student_progress")
      .upsert(
        {
          activity_id: activityId,
          student_id: studentId,
          items: items,
        },
        {
          onConflict: "activity_id,student_id",
        }
      );

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
