import type { Metadata } from "next";
import { Baby } from "lucide-react";
import StudentsTable from "@/components/dashboard/StudentsTable";

export const metadata: Metadata = {
  title: "Data Siswa | Guru Jurnal TK",
};

export default function TeacherStudentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Baby className="text-emerald-400" />
          Data Siswa
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Daftar siswa dan kelas TK Dharma Wanita Kepung 2
        </p>
      </div>

      <StudentsTable />
    </div>
  );
}
