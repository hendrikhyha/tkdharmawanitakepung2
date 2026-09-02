import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getParentChildren } from "@/services/parent";
import ChildSelector from "@/components/dashboard/ChildSelector";
import ProgressTimeline from "@/components/dashboard/ProgressTimeline";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Perkembangan Siswa | Orang Tua Jurnal TK",
};

export default async function ParentProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get children via student_parents junction
  const children = await getParentChildren(user.id);

  if (children.length === 0) redirect("/parent");

  const resolvedParams = await searchParams;
  const selectedChildId = resolvedParams.child || children[0]?.id || null;

  // For progress page, always show one child at a time (default to first child)
  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];

  if (!selectedChild) redirect("/parent");

  // Fetch progress data for selected child
  const { data: progressRaw } = await supabase
    .from("activity_student_progress")
    .select(`
      id,
      items,
      activity_id,
      activities (
        id,
        theme,
        sub_theme,
        activity_date,
        activity_time,
        status
      )
    `)
    .eq("student_id", selectedChild.id)
    .order("created_at", { ascending: false });

  // Filter to only published activities and map to expected format
  const progressData = ((progressRaw as any) || [])
    .filter((p: any) => p.activities?.status === "PUBLISHED")
    .map((p: any) => ({
      id: p.id,
      items: p.items,
      activity: {
        id: p.activities.id,
        theme: p.activities.theme,
        sub_theme: p.activities.sub_theme,
        activity_date: p.activities.activity_date,
        activity_time: p.activities.activity_time,
      },
    }));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-sm shadow-emerald-200">
          <TrendingUp size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Perkembangan Siswa
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Catatan perkembangan {selectedChild.name} berdasarkan penilaian kegiatan.
          </p>
        </div>
      </div>

      {/* Child Selector — always show for multi-child, default select first */}
      {children.length > 1 && (
        <ChildSelector
          children={children.map((c) => ({ id: c.id, name: c.name, className: c.className }))}
          selectedChildId={selectedChildId}
        />
      )}

      {/* Selected Child Info */}
      <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-inner">
          {selectedChild.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">{selectedChild.name}</h3>
          <p className="text-sm font-medium text-slate-500">
            {selectedChild.className || "Belum masuk kelas"}
          </p>
        </div>
      </div>

      {/* Progress Timeline */}
      <ProgressTimeline progressData={progressData} childName={selectedChild.name} />
    </div>
  );
}
