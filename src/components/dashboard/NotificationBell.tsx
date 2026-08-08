"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CircleAlert, CheckCircle2 } from "lucide-react";
import { TeacherNotification } from "@/services/teacher";
import { cn } from "@/lib/utils";

export default function NotificationBell({
  initialNotifications,
}: {
  initialNotifications: TeacherNotification[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  // We manage the state locally so they can dismiss notifications if allowed
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.length;

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
        aria-label="Notifikasi"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-950"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-800/50">
              <h3 className="font-bold text-white">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                  {unreadCount} Baru
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500/50" />
                  <p className="text-sm font-medium text-white/60">
                    Tidak ada notifikasi baru
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Semua tugas Anda sudah selesai.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.actionUrl}
                      onClick={() => setIsOpen(false)}
                      className="group relative flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/5"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                        <CircleAlert size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-white/60 leading-relaxed">
                          {notification.message}
                        </p>
                        <span className="mt-2 inline-block text-xs font-semibold text-emerald-400 hover:underline">
                          {notification.actionText} &rarr;
                        </span>
                      </div>
                      {notification.isDismissible && (
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          className="absolute right-3 top-3 rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                          title="Tutup Notifikasi"
                        >
                          &times;
                        </button>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
