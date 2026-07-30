import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getTeacherDashboardStats } from "@/services/teacher";
import StatCard from "@/components/dashboard/StatCard";
import AnnouncementCarousel from "@/components/dashboard/AnnouncementCarousel";
import { ClipboardList, Clock, Plus, Baby } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const metadata = {
  title: "Dashboard Guru | Jurnal TK",
};

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getTeacherDashboardStats(user.id);

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-white/60">Data guru tidak ditemukan.</p>
      </div>
    );
  }

  const todayStr = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">{todayStr}</p>
        </div>
        <Link
          href="/teacher/activities/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          Buat Jurnal Kegiatan
        </Link>
      </div>

      <AnnouncementCarousel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Siswa di Kelas"
          value={stats.classInfo?.studentCount || 0}
          description={stats.classInfo?.name || "Belum ada kelas"}
          icon={Baby}
          color="emerald"
        />
        <StatCard
          title="Kegiatan Hari Ini"
          value={stats.activitiesCount.today}
          description="Jurnal kegiatan hari ini"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Total Kegiatan"
          value={stats.activitiesCount.total}
          description="Total jurnal yang dibuat"
          icon={ClipboardList}
          color="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Activities */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Kegiatan Hari Ini</h2>
            <Link
              href="/teacher/activities"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Lihat Semua
            </Link>
          </div>
          
          {stats.todayActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 py-12">
              <ClipboardList className="mb-3 h-10 w-10 text-white/20" />
              <p className="text-sm font-medium text-white/60">Belum ada kegiatan</p>
              <p className="mt-1 text-xs text-white/40">Buat jurnal kegiatan pertama Anda hari ini.</p>
              <Link
                href="/teacher/activities/new"
                className="mt-4 text-sm text-emerald-400 hover:underline"
              >
                Buat Sekarang &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.todayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 p-4 transition hover:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{activity.title}</h3>
                      <p className="text-sm text-white/50">
                        {activity.activity_time ? activity.activity_time.slice(0, 5) : "Waktu tidak ditentukan"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      activity.status === "PUBLISHED"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access or Notifications */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-lg font-bold text-white">Akses Cepat</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/teacher/activities"
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-6 transition hover:bg-white/10 hover:border-emerald-500/50"
            >
              <div className="rounded-full bg-blue-500/20 p-3 text-blue-400 group-hover:scale-110 transition-transform">
                <ClipboardList size={24} />
              </div>
              <span className="font-medium text-white">Semua Kegiatan</span>
            </Link>
            <Link
              href="/teacher/students"
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-6 transition hover:bg-white/10 hover:border-emerald-500/50"
            >
              <div className="rounded-full bg-violet-500/20 p-3 text-violet-400 group-hover:scale-110 transition-transform">
                <Baby size={24} />
              </div>
              <span className="font-medium text-white">Data Siswa</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
