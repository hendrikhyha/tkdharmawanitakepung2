"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import ParentSidebar from "./ParentSidebar";
import { UserProfile } from "@/types/user";

interface ParentShellProps {
  children: React.ReactNode;
  user: UserProfile;
}

export default function ParentShell({ children, user }: ParentShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 font-sans">
      <ParentSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
        
        {/* Mobile Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/50 backdrop-blur-md px-4 lg:hidden z-10">
          <span className="font-bold text-slate-800 text-lg tracking-tight">Orang Tua</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
