import type { Metadata } from "next";
import { Users } from "lucide-react";
import ParentsTable from "@/components/dashboard/ParentsTable";

export const metadata: Metadata = {
  title: "Data Orang Tua | Admin Jurnal TK",
};

export default function ParentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Users className="text-emerald-400" />
          Data Orang Tua
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola data orang tua TK Dharma Wanita Kepung 2
        </p>
      </div>
      
      <ParentsTable />
    </div>
  );
}
