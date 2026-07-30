import { createClient } from "@/utils/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import { getAnnouncements, Announcement } from "@/app/actions/announcements";

// Re-export the type
export type { Announcement };

/**
 * Query options for fetching announcements.
 * Usage: const { data } = useQuery(announcementsQueryOptions())
 */
export const announcementsQueryOptions = () =>
  queryOptions({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await getAnnouncements();
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Uploads an image to the 'announcements' bucket and creates a DB record.
 */
export async function uploadAnnouncementService(file: File) {
  const supabase = createClient();
  
  // 1. Upload to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from("announcements")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (storageError) {
    throw new Error(`Gagal mengunggah gambar: ${storageError.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase
    .storage
    .from("announcements")
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  // 2. Insert into DB
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error("Not authenticated");

  const { data: dbData, error: dbError } = await supabase
    .from("announcement_images")
    .insert([
      {
        image_url: imageUrl,
        uploaded_by: userAuth.user.id,
        // order_index default is 0
      }
    ])
    .select()
    .single();

  if (dbError) {
    throw new Error(`Gagal menyimpan data pengumuman: ${dbError.message}`);
  }

  return dbData as Announcement;
}
