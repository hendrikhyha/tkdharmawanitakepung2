import { createClient } from "@/utils/supabase/server";

/**
 * Uploads a file to the Supabase Storage 'activities' bucket.
 * This runs on the server (Server Action / API route).
 */
export async function uploadActivityPhoto(
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();

  // Convert File to ArrayBuffer for uploading
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from("activities")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("activities")
    .getPublicUrl(data.path);

  return { url: publicUrlData.publicUrl, error: null };
}

/**
 * Deletes a file from Supabase Storage 'activities' bucket.
 */
export async function deleteActivityPhoto(path: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from("activities").remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
