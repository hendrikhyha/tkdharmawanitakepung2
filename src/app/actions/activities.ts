"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadActivityPhoto, deleteActivityPhoto } from "@/utils/supabase/storage";
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

export async function createActivity(formData: FormData) {
  try {
    const supabase = await createClient();
    const { teacherId, classId } = await getTeacherContext(supabase);

    const theme = formData.get("theme") as string;
    const sub_theme = formData.get("sub_theme") as string || null;
    const description = formData.get("description") as string;
    const activity_date = formData.get("activity_date") as string;
    const activity_time = formData.get("activity_time") as string || null;
    const status = formData.get("status") as "DRAFT" | "PUBLISHED";
    const photos = formData.getAll("photos") as File[];

    if (!theme || !activity_date) {
      return { error: "Tema dan tanggal wajib diisi" };
    }

    // 1. Get next sort order
    const { data: countData } = await supabase
      .from("activities")
      .select("sort_order")
      .eq("class_id", classId)
      .eq("activity_date", activity_date);
    
    const nextSortOrder = countData ? countData.length : 0;

    // 2. Insert Activity
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        teacher_id: teacherId,
        class_id: classId,
        theme,
        sub_theme,
        description: description || null,
        activity_date,
        activity_time,
        status,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (activityError || !activity) {
      return { error: activityError?.message || "Gagal membuat kegiatan" };
    }

    // 3. Upload and Insert Photos
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        if (file.size === 0) continue; // Skip empty files

        const fileExt = file.name.split(".").pop();
        const filePath = `${teacherId}/${activity.id}/${Date.now()}_${i}.${fileExt}`;

        const { url, error: uploadError } = await uploadActivityPhoto(file, filePath);
        if (uploadError || !url) {
          // Note: Ideally we rollback, but for simplicity we continue and report error
          console.error("Upload error:", uploadError);
          continue;
        }

        await supabase.from("activity_photos").insert({
          activity_id: activity.id,
          image_url: url,
        });
      }
    }

    revalidatePath("/teacher/activities");
    return { success: true, activityId: activity.id };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function updateActivity(activityId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { teacherId } = await getTeacherContext(supabase);

    const theme = formData.get("theme") as string;
    const sub_theme = formData.get("sub_theme") as string || null;
    const description = formData.get("description") as string;
    const activity_date = formData.get("activity_date") as string;
    const activity_time = formData.get("activity_time") as string || null;
    const status = formData.get("status") as "DRAFT" | "PUBLISHED";
    
    // Photo management
    const photosToDelete = JSON.parse(formData.get("photos_to_delete") as string || "[]") as string[]; // public URLs
    const newPhotos = formData.getAll("new_photos") as File[];

    if (!theme || !activity_date) {
      return { error: "Tema dan tanggal wajib diisi" };
    }

    // 1. Update basic info
    const { error: updateError } = await supabase
      .from("activities")
      .update({
        theme,
        sub_theme,
        description: description || null,
        activity_date,
        activity_time,
        status,
      })
      .eq("id", activityId)
      .eq("teacher_id", teacherId); // Security check: must own

    if (updateError) return { error: updateError.message };

    // 2. Delete selected photos
    if (photosToDelete.length > 0) {
      for (const url of photosToDelete) {
        // Extract filepath from public URL
        // Example URL: .../storage/v1/object/public/activities/teacherId/activityId/file.png
        const pathPart = url.split("/public/activities/")[1];
        if (pathPart) {
          await deleteActivityPhoto(pathPart);
        }
        await supabase.from("activity_photos").delete().eq("image_url", url);
      }
    }

    // 3. Upload new photos
    if (newPhotos && newPhotos.length > 0) {
      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i];
        if (file.size === 0) continue;

        const fileExt = file.name.split(".").pop();
        const filePath = `${teacherId}/${activityId}/${Date.now()}_${i}.${fileExt}`;

        const { url, error: uploadError } = await uploadActivityPhoto(file, filePath);
        if (uploadError || !url) continue;

        await supabase.from("activity_photos").insert({
          activity_id: activityId,
          image_url: url,
        });
      }
    }

    revalidatePath("/teacher/activities");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const supabase = await createClient();
    const { teacherId } = await getTeacherContext(supabase);

    // 1. Get associated photos
    const { data: photos } = await supabase
      .from("activity_photos")
      .select("image_url")
      .eq("activity_id", activityId);

    // 2. Delete photos from storage
    if (photos && photos.length > 0) {
      for (const p of photos) {
        const pathPart = p.image_url.split("/public/activities/")[1];
        if (pathPart) {
          await deleteActivityPhoto(pathPart);
        }
      }
    }

    // 3. Delete from DB (cascade deletes activity_photos row in DB)
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId)
      .eq("teacher_id", teacherId);

    if (error) return { error: error.message };

    revalidatePath("/teacher/activities");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function reorderActivities(orderedIds: string[]) {
  try {
    const supabase = await createClient();
    const { teacherId } = await getTeacherContext(supabase);

    // Bulk update sort order
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await supabase
        .from("activities")
        .update({ sort_order: i })
        .eq("id", id)
        .eq("teacher_id", teacherId);
    }

    revalidatePath("/teacher/activities");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function publishActivity(activityId: string, status: "DRAFT" | "PUBLISHED") {
  try {
    const supabase = await createClient();
    const { teacherId } = await getTeacherContext(supabase);

    const { error } = await supabase
      .from("activities")
      .update({ status })
      .eq("id", activityId)
      .eq("teacher_id", teacherId);

    if (error) return { error: error.message };

    revalidatePath("/teacher/activities");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
