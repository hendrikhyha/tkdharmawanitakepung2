"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { UserProfile } from "@/types/user";

interface AdminShellProps {
  user: UserProfile;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar (mobile) */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <p className="text-sm font-semibold text-white">Admin Panel</p>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
