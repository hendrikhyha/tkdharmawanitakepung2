import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export const metadata = {
  title: "Absensi Harian | Jurnal TK",
};

export default async function AttendancePage() {
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

  // Ambil daftar siswa di kelas ini
  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("class_id", classData.id)
    .order("name", { ascending: true });

  if (!students || students.length === 0) {
    return <div className="p-8 text-white">Tidak ada siswa di kelas ini.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Absensi Harian</h1>
        <p className="mt-1 text-sm text-white/50">
          Kelas: {classData.name} | Total Siswa: {students.length}
        </p>
      </div>

      <AttendanceClient 
        classId={classData.id} 
        students={students} 
      />
    </div>
  );
}
