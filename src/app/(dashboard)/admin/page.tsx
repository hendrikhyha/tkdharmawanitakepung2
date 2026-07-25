import type { Metadata } from "next";
import { GraduationCap, Users, Baby, BookOpen, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { getAdminStats } from "@/services/admin";

export const metadata: Metadata = {
  title: "Dashboard Admin | Jurnal TK Dharma Wanita Kepung 2",
  description: "Panel admin untuk mengelola data TK Dharma Wanita Kepung 2.",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Ringkasan data TK Dharma Wanita Kepung 2
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Guru"
          value={stats.totalTeachers}
          description="Guru aktif terdaftar"
          icon={GraduationCap}
          color="violet"
        />
        <StatCard
          title="Siswa"
          value={stats.totalStudents}
          description="Siswa aktif terdaftar"
          icon={Baby}
          color="blue"
        />
        <StatCard
          title="Orang Tua"
          value={stats.totalParents}
          description="Orang tua terdaftar"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Kelas"
          value={stats.totalClasses}
          description="Kelas aktif"
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Quick Summary Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">Ringkasan</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold text-violet-400">
              {stats.totalTeachers}
            </p>
            <p className="mt-0.5 text-xs text-white/50">Guru</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              {stats.totalStudents}
            </p>
            <p className="mt-0.5 text-xs text-white/50">Siswa</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.totalParents}
            </p>
            <p className="mt-0.5 text-xs text-white/50">Orang Tua</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">
              {stats.totalClasses}
            </p>
            <p className="mt-0.5 text-xs text-white/50">Kelas</p>
          </div>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40">
            Rata-rata:{" "}
            <span className="text-white/70">
              {stats.totalClasses > 0
                ? Math.round(stats.totalStudents / stats.totalClasses)
                : 0}{" "}
              siswa per kelas
            </span>
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-semibold text-white">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Tambah Guru", href: "/admin/teachers", icon: GraduationCap, color: "text-violet-400" },
            { label: "Tambah Siswa", href: "/admin/students", icon: Baby, color: "text-blue-400" },
            { label: "Tambah Orang Tua", href: "/admin/parents", icon: Users, color: "text-emerald-400" },
            { label: "Tambah Kelas", href: "/admin/classes", icon: BookOpen, color: "text-orange-400" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition hover:bg-white/10"
            >
              <action.icon size={22} className={action.color} />
              <span className="text-xs font-medium text-white/70">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
