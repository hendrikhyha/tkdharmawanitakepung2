import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProgressForm from "@/components/dashboard/ProgressForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get activity details
  const { data: activity, error } = await supabase
    .from("activities")
    .select("*, classes(name)")
    .eq("id", id)
    .single();

  if (error || !activity) {
    redirect("/teacher/activities");
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/activities"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Penilaian Perkembangan
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Jurnal: {activity.title} • {activity.classes?.name}
          </p>
        </div>
      </div>

      <ProgressForm activityId={id} />
    </div>
  );
}
