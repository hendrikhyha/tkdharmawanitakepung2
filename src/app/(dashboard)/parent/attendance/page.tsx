import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getParentChildren } from "@/services/parent";
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

  // Get children via student_parents junction table
  const children = await getParentChildren(user.id);

  if (children.length === 0) {
    return <div className="p-8 text-slate-500 font-medium">Belum ada data anak yang terdaftar.</div>;
  }

  // Map to the format expected by ParentAttendanceClient
  const students = children.map((c) => ({
    id: c.id,
    name: c.name,
    classes: c.className ? { name: c.className } : null,
  }));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kehadiran Anak</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Pantau absensi harian putra/putri Anda
        </p>
      </div>

      <ParentAttendanceClient students={students} />
    </div>
  );
}
