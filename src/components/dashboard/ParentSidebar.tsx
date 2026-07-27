"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Image as ImageIcon,
  User,
  X,
  BookOpenCheck,
} from "lucide-react";
import LogoutButton from "@/components/shared/LogoutButton";
import { UserProfile } from "@/types/user";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/parent", label: "Beranda", icon: LayoutDashboard, exact: true },
  { href: "/parent/timeline", label: "Lini Masa", icon: Clock },
  { href: "/parent/gallery", label: "Galeri Foto", icon: ImageIcon },
  { href: "/parent/attendance", label: "Kehadiran", icon: BookOpenCheck },
  { href: "/parent/profile", label: "Profil", icon: User },
];

interface ParentSidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentSidebar({
  user,
  isOpen,
  onClose,
}: ParentSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform flex-col border-r border-slate-200/50 bg-white/90 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-6">
          <Link
            href="/parent"
            className="flex items-center gap-3 transition-transform hover:scale-105 duration-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dharma-wanita.png"
                alt="Logo Dharma Wanita"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-800 tracking-tight block leading-tight">
                Orang Tua
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
                TK Dharma Wanita
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200",
                    active
                      ? "bg-pink-100 text-pink-600 shadow-sm shadow-pink-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    active ? "bg-white/60 text-pink-600" : "bg-transparent text-slate-400 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm"
                  )}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-200/50 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3 border border-slate-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-base font-bold text-white shadow-sm shadow-pink-200 overflow-hidden border border-white/50">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-slate-800">
                {user.name}
              </span>
              <span className="truncate text-xs font-medium text-slate-500">
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
