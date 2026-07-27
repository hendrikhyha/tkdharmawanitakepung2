"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Baby,
  BookOpen,
  X,
} from "lucide-react";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/teachers", label: "Guru", icon: GraduationCap },
  { href: "/admin/parents", label: "Orang Tua", icon: Users },
  { href: "/admin/students", label: "Siswa", icon: Baby },
  { href: "/admin/classes", label: "Kelas", icon: BookOpen },
];

interface AdminSidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  user,
  isOpen,
  onClose,
}: AdminSidebarProps) {
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
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gradient-to-b from-violet-900 to-indigo-900 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 p-1 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dharma-wanita.png"
                alt="Logo Dharma Wanita"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Jurnal TK</p>
              <p className="text-[10px] text-white/50">Dharma Wanita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu Utama
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive(item.href, item.exact)
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      isActive(item.href, item.exact)
                        ? "text-yellow-400"
                        : "text-white/50"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <p className="text-[10px] text-white/50">Administrator</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
