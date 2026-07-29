import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AcademicYearsTable from "@/components/dashboard/AcademicYearsTable";

export const metadata = {
  title: "Manajemen Tahun Ajaran | Jurnal TK",
};

export default async function AcademicYearsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tahun Ajaran</h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola tahun ajaran pendaftaran siswa dan periode akademik.
        </p>
      </div>

      <AcademicYearsTable />
    </div>
  );
}
