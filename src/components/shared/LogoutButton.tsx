"use client";

import { logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  return (
    <button
      id="logout-btn"
      onClick={handleLogout}
      disabled={isLoading}
      className={className || "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"}
    >
      <LogOut size={18} />
      <span>{isLoading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
