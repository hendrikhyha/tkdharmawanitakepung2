"use server";

import { createClient } from "@/utils/supabase/server";

export type Announcement = {
  id: string;
  image_url: string;
  order_index: number;
  created_at: string;
  uploaded_by: string;
};

export async function getAnnouncements() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcement_images")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching announcements:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Announcement[], error: null };
  } catch (err: any) {
    console.error("Error fetching announcements:", err);
    return { data: null, error: err.message };
  }
}

export async function deleteAnnouncementAction(id: string, imageUrl: string) {
  try {
    const supabase = await createClient();
    
    // 1. Delete from storage bucket
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error: storageError } = await supabase
      .storage
      .from('announcements')
      .remove([fileName]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
      // We continue to delete from DB even if storage fails (e.g. if file already deleted)
    }

    // 2. Delete from DB
    const { error: dbError } = await supabase
      .from("announcement_images")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting announcement:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("Error deleting announcement:", err);
    return { success: false, error: err.message };
  }
}
