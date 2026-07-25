import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import ClassesTable from "@/components/dashboard/ClassesTable";

export const metadata: Metadata = {
  title: "Data Kelas | Admin Jurnal TK",
};

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <BookOpen className="text-orange-400" />
          Data Kelas
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola data kelas TK Dharma Wanita Kepung 2
        </p>
      </div>
      
      <ClassesTable />
    </div>
  );
}
