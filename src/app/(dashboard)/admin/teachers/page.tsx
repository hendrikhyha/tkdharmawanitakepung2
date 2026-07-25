import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import TeachersTable from "@/components/dashboard/TeachersTable";

export const metadata: Metadata = {
  title: "Data Guru | Admin Jurnal TK",
};

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <GraduationCap className="text-violet-400" />
          Data Guru
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola data guru TK Dharma Wanita Kepung 2
        </p>
      </div>
      
      <TeachersTable />
    </div>
  );
}
