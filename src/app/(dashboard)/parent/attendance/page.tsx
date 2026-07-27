import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ParentAttendanceClient from "./ParentAttendanceClient";

export const metadata = {
  title: "Kehadiran | Jurnal TK",
};

export default async function ParentAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get parent profile
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!parent) {
    return <div className="p-8 text-white">Data orang tua tidak ditemukan.</div>;
  }

  // Get children (students) for this parent
  const { data: students } = await supabase
    .from("students")
    .select("id, name, classes(name)")
    .eq("parent_id", parent.id);

  if (!students || students.length === 0) {
    return <div className="p-8 text-white">Belum ada data anak yang terdaftar.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#FF85A2] tracking-tight drop-shadow-sm">Kehadiran Anak</h1>
        <p className="mt-1 text-sm text-[#748E63]/80 font-medium">
          Pantau absensi harian putra/putri Anda
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ParentAttendanceClient students={students as any} />
    </div>
  );
}
