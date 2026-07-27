import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AttendanceReportClient from "./AttendanceReportClient";

export const metadata = {
  title: "Laporan Absensi | Jurnal TK",
};

export default async function AttendanceReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!teacher) {
    return <div className="p-8 text-white">Guru tidak ditemukan.</div>;
  }

  const { data: classData } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", teacher.id)
    .single();

  if (!classData) {
    return <div className="p-8 text-white">Anda belum ditugaskan ke kelas manapun.</div>;
  }

  // Get all students to initialize the report table columns/rows
  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("class_id", classData.id)
    .order("name", { ascending: true });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Laporan Absensi</h1>
        <p className="mt-1 text-sm text-white/50">
          Kelas: {classData.name}
        </p>
      </div>

      <AttendanceReportClient 
        classId={classData.id} 
        students={students || []} 
      />
    </div>
  );
}
