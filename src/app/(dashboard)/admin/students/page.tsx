import type { Metadata } from "next";
import { Baby } from "lucide-react";
import StudentsTable from "@/components/dashboard/StudentsTable";

export const metadata: Metadata = {
  title: "Data Siswa | Admin Jurnal TK",
};

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Baby className="text-blue-400" />
          Data Siswa
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola data siswa TK Dharma Wanita Kepung 2
        </p>
      </div>
      
      <StudentsTable />
    </div>
  );
}
