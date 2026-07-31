import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getParentDashboardData } from "@/services/parent";
import StatCard from "@/components/dashboard/StatCard";
import AnnouncementCarousel from "@/components/dashboard/AnnouncementCarousel";
import { Baby, Clock, Image as ImageIcon, Sun, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const metadata = {
  title: "Beranda Orang Tua | Jurnal TK",
};

export default async function ParentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getParentDashboardData(user.id);

  if (!data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">Data orang tua tidak ditemukan.</p>
      </div>
    );
  }

  const todayStr = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center">
            Halo, {user.user_metadata?.name?.split(' ')[0] || 'Ayah/Bunda'}!
            <Sun className="inline-block ml-3 text-amber-400 h-8 w-8 animate-spin-slow" />
          </h1>
        </div>
        <p className="mt-2 text-slate-500 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sky-400" />
          {todayStr}
        </p>
      </div>

      <AnnouncementCarousel />

      {/* Children Info Cards */}
      {data.children.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">
            Buah Hati Anda
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.children.map((child) => (
              <div
                key={child.id}
                className="group flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-inner group-hover:scale-110 transition-transform">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">{child.name}</h3>
                  <p className="text-sm font-medium text-slate-500">
                    {child.className || "Belum masuk kelas"}
                    {child.birth_date && ` · Lahir: ${child.birth_date}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Anak Terdaftar"
          value={data.children.length}
          description="Anak yang terhubung ke akun Anda"
          icon={Baby}
          color="violet"
        />
        <StatCard
          title="Kegiatan Terbaru"
          value={data.recentActivities.length}
          description="Jurnal terbaru dari guru kelas"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Total Foto"
          value={data.totalPhotos}
          description="Foto kegiatan anak"
          icon={ImageIcon}
          color="emerald"
        />
      </div>

      {/* Recent Activities Preview */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800">Kegiatan Terbaru</h2>
          <Link
            href="/parent/timeline"
            className="text-sm font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl transition"
          >
            Lihat Semua
          </Link>
        </div>

        {data.recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12">
            <Clock className="mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">
              Belum ada kegiatan yang diterbitkan
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Guru kelas akan segera mengunggah kegiatan harian anak Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="group rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-pink-600 transition-colors">{activity.theme}</h3>
                    {activity.sub_theme && activity.sub_theme !== "-" && (
                      <p className="mt-1 text-sm font-bold text-pink-500">
                        {activity.sub_theme}
                      </p>
                    )}
                    <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(activity.activity_date), "d MMMM yyyy", { locale: id })}
                      {activity.activity_time && ` · ${activity.activity_time.slice(0, 5)}`}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  {(activity.activity_photos?.length ?? 0) > 0 && (
                    <span className="ml-3 shrink-0 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl px-3 py-1.5">
                      {activity.activity_photos?.length} foto
                    </span>
                  )}
                </div>

                {/* Progress Preview */}
                {activity.activity_student_progress && activity.activity_student_progress.length > 0 && (
                  <div className="mt-4 rounded-xl bg-pink-50/50 p-4 border border-pink-100">
                    <h4 className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">Catatan Perkembangan Anak</h4>
                    <div className="space-y-3">
                      {activity.activity_student_progress.map((progress, idx) => {
                        const childName = data.children.find(c => c.id === progress.student_id)?.name || "Anak";
                        return (
                          <div key={idx} className="text-sm">
                            <span className="font-semibold text-slate-700">{childName}:</span>
                            <p className="mt-1 text-slate-600 leading-relaxed bg-white rounded-lg p-3 border border-pink-50">{progress.notes}</p>
                            {progress.photo_url && (
                              <div className="mt-2 aspect-video w-full max-w-[200px] rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={progress.photo_url} alt="Foto Perkembangan" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Photo thumbnails */}
                {(activity.activity_photos?.length ?? 0) > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {(activity.activity_photos || []).slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="shrink-0 h-20 w-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.image_url}
                          alt="Foto Kegiatan"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    ))}
                    {(activity.activity_photos?.length ?? 0) > 3 && (
                      <div className="shrink-0 h-20 w-28 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
                        +{(activity.activity_photos?.length ?? 0) - 3} lagi
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
