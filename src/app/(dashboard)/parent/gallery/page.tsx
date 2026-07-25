import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Image as ImageIcon, Download, Camera } from "lucide-react";

export const metadata = {
  title: "Galeri Foto | Orang Tua Jurnal TK",
};

interface PhotoItem {
  id: string;
  image_url: string;
  activity: {
    title: string;
    activity_date: string;
  };
}

export default async function ParentGalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get parent -> children -> class_ids
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!parent) redirect("/parent");

  const { data: students } = await supabase
    .from("students")
    .select("class_id")
    .eq("parent_id", parent.id);

  const classIds = [...new Set((students || []).map((s) => s.class_id).filter(Boolean))] as string[];

  let photos: PhotoItem[] = [];

  if (classIds.length > 0) {
    // Get published activity IDs for those classes
    const { data: activities } = await supabase
      .from("activities")
      .select("id, title, activity_date")
      .in("class_id", classIds)
      .eq("status", "PUBLISHED")
      .order("activity_date", { ascending: false })
      .limit(50);

    if (activities && activities.length > 0) {
      const activityIds = activities.map((a) => a.id);

      const { data: photoData } = await supabase
        .from("activity_photos")
        .select("id, image_url, activity_id")
        .in("activity_id", activityIds)
        .order("created_at", { ascending: false });

      photos = (photoData || []).map((p) => {
        const act = activities.find((a) => a.id === p.activity_id);
        return {
          id: p.id,
          image_url: p.image_url,
          activity: {
            title: act?.title || "Kegiatan",
            activity_date: act?.activity_date || "",
          },
        };
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 text-white shadow-sm shadow-blue-200">
          <Camera size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Galeri Foto
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Kumpulan momen manis buah hati Anda di sekolah.
          </p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center backdrop-blur-md shadow-sm">
          <ImageIcon className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <p className="text-base font-bold text-slate-600">
            Belum ada foto kegiatan
          </p>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Foto akan muncul setelah Guru mengunggah jurnal kegiatan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-1"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt={photo.activity.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Download Button */}
                <a
                  href={photo.image_url}
                  download={`Foto_${photo.activity.activity_date}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-pink-500 rounded-xl text-slate-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-sm backdrop-blur-sm"
                  title="Download Foto"
                >
                  <Download size={18} strokeWidth={2.5} />
                </a>

                {/* Overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pt-12">
                  <p className="text-sm font-bold text-white truncate drop-shadow-md">
                    {photo.activity.title}
                  </p>
                  <p className="text-xs font-medium text-white/80 drop-shadow-md mt-0.5">
                    {photo.activity.activity_date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
