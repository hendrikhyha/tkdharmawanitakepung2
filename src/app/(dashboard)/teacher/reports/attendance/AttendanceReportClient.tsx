"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAttendanceReport, AttendanceRecord } from "@/services/attendance";

type Student = {
  id: string;
  name: string;
};

type Props = {
  classId: string;
  students: Student[];
};

export default function AttendanceReportClient({ classId, students }: Props) {
  // Default to this week
  const [startDate, setStartDate] = useState<string>(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = useCallback(async (start: string, end: string) => {
    setIsLoading(true);
    try {
      const data = await getAttendanceReport(classId, start, end);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (startDate && endDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReport(startDate, endDate);
    }
  }, [startDate, endDate, fetchReport]);

  const setThisWeek = () => {
    setStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
    setEndDate(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  };

  const setThisMonth = () => {
    setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  };

  // Process data for the table
  const processedData = useMemo(() => {
    const report: Record<string, { present: number, sick: number, excused: number, absent: number, total: number }> = {};
    
    // Initialize
    students.forEach(s => {
      report[s.id] = { present: 0, sick: 0, excused: 0, absent: 0, total: 0 };
    });

    // Populate
    records.forEach(r => {
      if (report[r.student_id]) {
        report[r.student_id].total++;
        if (r.status === "PRESENT") report[r.student_id].present++;
        else if (r.status === "SICK") report[r.student_id].sick++;
        else if (r.status === "EXCUSED") report[r.student_id].excused++;
        else if (r.status === "ABSENT") report[r.student_id].absent++;
      }
    });

    return report;
  }, [records, students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-white/80">Dari Tanggal</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                id="startDate" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 border-white/10 bg-slate-900 text-white focus-visible:ring-blue-400/30 [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-white/80">Sampai Tanggal</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input 
                id="endDate" 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9 border-white/10 bg-slate-900 text-white focus-visible:ring-blue-400/30 [color-scheme:dark]"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mb-0.5">
            <button onClick={setThisWeek} className="px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
              Minggu Ini
            </button>
            <button onClick={setThisMonth} className="px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
              Bulan Ini
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center flex-col gap-3">
            <Loader2 className="animate-spin text-white/40 h-8 w-8" />
            <p className="text-white/40 text-sm">Menghitung rekap...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-white/60">
                <tr>
                  <th className="p-4 font-medium">Nama Siswa</th>
                  <th className="p-4 font-medium text-center text-emerald-400">Hadir</th>
                  <th className="p-4 font-medium text-center text-blue-400">Sakit</th>
                  <th className="p-4 font-medium text-center text-yellow-400">Izin</th>
                  <th className="p-4 font-medium text-center text-red-400">Alpa</th>
                  <th className="p-4 font-medium text-center">Total Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => {
                  const data = processedData[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{student.name}</td>
                      <td className="p-4 text-center font-bold text-emerald-400">{data.present}</td>
                      <td className="p-4 text-center font-bold text-blue-400">{data.sick}</td>
                      <td className="p-4 text-center font-bold text-yellow-400">{data.excused}</td>
                      <td className="p-4 text-center font-bold text-red-400">{data.absent}</td>
                      <td className="p-4 text-center text-white/60 font-semibold">{data.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
