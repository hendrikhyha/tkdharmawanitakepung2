"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Baby,
  User,
  X,
  BookOpenCheck,
  FileText,
  FileSpreadsheet,
  Megaphone,
} from "lucide-react";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/teacher/activities", label: "Kegiatan", icon: ClipboardList },
  { href: "/teacher/attendance", label: "Absensi", icon: BookOpenCheck },
  { href: "/teacher/reports", label: "Laporan Kegiatan", icon: FileText, exact: true },
  { href: "/teacher/reports/attendance", label: "Laporan Absensi", icon: FileSpreadsheet },
  { href: "/teacher/announcements", label: "Pengumuman", icon: Megaphone },
  { href: "/teacher/students", label: "Siswa", icon: Baby },
  { href: "/teacher/profile", label: "Profil", icon: User },
];

interface TeacherSidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherSidebar({
  user,
  isOpen,
  onClose,
}: TeacherSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform flex-col border-r border-white/10 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/teacher"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 p-1 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dharma-wanita.png"
                alt="Logo Dharma Wanita"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-tight">
                Guru TK
              </span>
              <span className="text-[10px] text-white/50 block leading-tight">
                Dharma Wanita
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-colors",
                      active ? "text-emerald-400" : "text-white/40 group-hover:text-white"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white overflow-hidden border border-white/10">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="truncate text-xs text-white/50">
                {user.email}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
