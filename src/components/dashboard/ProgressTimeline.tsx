"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { FileText, Camera, ChevronDown, ChevronUp } from "lucide-react";

interface ProgressEntry {
  id: string;
  notes: string;
  photo_url: string | null;
  activity: {
    id: string;
    theme: string;
    sub_theme: string | null;
    activity_date: string;
    activity_time: string | null;
  };
}

interface MonthGroup {
  month: string; // e.g. "2026-08"
  label: string; // e.g. "Agustus 2026"
  entries: ProgressEntry[];
}

interface ProgressTimelineProps {
  progressData: ProgressEntry[];
  childName: string;
}

export default function ProgressTimeline({ progressData, childName }: ProgressTimelineProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group by month
  const grouped: Record<string, ProgressEntry[]> = {};
  for (const entry of progressData) {
    const monthKey = entry.activity.activity_date.slice(0, 7); // "YYYY-MM"
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(entry);
  }

  const monthGroups: MonthGroup[] = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, entries]) => ({
      month,
      label: format(new Date(month + "-01"), "MMMM yyyy", { locale: idLocale }),
      entries: entries.sort((a, b) => b.activity.activity_date.localeCompare(a.activity.activity_date)),
    }));

  // Auto-expand the first month
  if (monthGroups.length > 0 && expandedMonths.size === 0) {
    expandedMonths.add(monthGroups[0].month);
  }

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  if (progressData.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <p className="text-base font-bold text-slate-600">
          Belum ada catatan perkembangan
        </p>
        <p className="mt-2 text-sm font-medium text-slate-400">
          Catatan perkembangan akan muncul setelah guru memberikan penilaian pada kegiatan.
        </p>
      </div>
    );
  }

  // Stats
  const totalActivities = progressData.length;
  const withPhotos = progressData.filter((p) => p.photo_url).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm text-center">
          <span className="text-3xl font-black text-emerald-500 block mb-1">{totalActivities}</span>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Kegiatan Dinilai</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm text-center">
          <span className="text-3xl font-black text-blue-500 block mb-1">{withPhotos}</span>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Dengan Foto</span>
        </div>
      </div>

      {/* Monthly Accordion */}
      <div className="space-y-4">
        {monthGroups.map((group) => {
          const isExpanded = expandedMonths.has(group.month);
          return (
            <div key={group.month} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(group.month)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {group.entries.length}
                  </div>
                  <div className="text-left">
                    <h3 className="font-extrabold text-slate-800 text-lg capitalize">{group.label}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      {group.entries.length} catatan perkembangan
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-slate-400" size={20} />
                ) : (
                  <ChevronDown className="text-slate-400" size={20} />
                )}
              </button>

              {/* Entries */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="p-5 hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Date badge */}
                        <div className="shrink-0 w-16 text-center">
                          <span className="text-2xl font-black text-indigo-500 block leading-none">
                            {format(new Date(entry.activity.activity_date), "dd")}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">
                            {format(new Date(entry.activity.activity_date), "EEE", { locale: idLocale })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800">{entry.activity.theme}</h4>
                            {entry.activity.activity_time && (
                              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                                {entry.activity.activity_time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                          {entry.activity.sub_theme && entry.activity.sub_theme !== "-" && (
                            <p className="text-sm font-semibold text-pink-500 mt-1">
                              {entry.activity.sub_theme}
                            </p>
                          )}

                          {/* Notes */}
                          <div className="mt-3 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100">
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                              {entry.notes}
                            </p>
                          </div>

                          {/* Photo */}
                          {entry.photo_url && (
                            <div className="mt-3 flex items-center gap-2">
                              <Camera size={14} className="text-blue-400" />
                              <div className="aspect-video w-full max-w-[240px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={entry.photo_url}
                                  alt="Foto Perkembangan"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
