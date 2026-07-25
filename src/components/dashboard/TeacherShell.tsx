"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import TeacherSidebar from "./TeacherSidebar";
import { UserProfile } from "@/types/user";

interface TeacherShellProps {
  children: React.ReactNode;
  user: UserProfile;
}

export default function TeacherShell({ children, user }: TeacherShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950">
      <TeacherSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950 px-4 lg:hidden">
          <span className="font-bold text-white">Guru TK</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
