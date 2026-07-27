"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { getStudentAttendance, AttendanceRecord } from "@/services/attendance";

type StudentInfo = {
  id: string;
  name: string;
  classes: { name: string } | null;
};

type Props = {
  students: StudentInfo[];
};

export default function ParentAttendanceClient({ students }: Props) {
  const [selectedStudent, setSelectedStudent] = useState<string>(students[0]?.id || "");
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendance = useCallback(async (studentId: string, start: string, end: string) => {
    setIsLoading(true);
    try {
      const data = await getStudentAttendance(studentId, start, end);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudent && startDate && endDate) {
      fetchAttendance(selectedStudent, startDate, endDate);
    }
  }, [selectedStudent, startDate, endDate, fetchAttendance]);

  const summary = {
    present: records.filter(r => r.status === "PRESENT").length,
    sick: records.filter(r => r.status === "SICK").length,
    excused: records.filter(r => r.status === "EXCUSED").length,
    absent: records.filter(r => r.status === "ABSENT").length,
  };

  const statusMap = {
    "PRESENT": { label: "Hadir", style: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "SICK": { label: "Sakit", style: "bg-blue-100 text-blue-700 border-blue-200" },
    "EXCUSED": { label: "Izin", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    "ABSENT": { label: "Alpa", style: "bg-red-100 text-red-700 border-red-200" },
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/60 p-5 rounded-3xl border-2 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-wrap items-center gap-4">
        {students.length > 1 && (
          <div className="space-y-1 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#748E63] uppercase tracking-wider ml-1">Pilih Anak</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full sm:w-48 h-10 px-3 rounded-2xl border-2 border-[#E5E7EB] bg-white text-slate-700 text-sm font-medium focus:border-[#FFB6C1] focus:ring-0 outline-none transition-colors"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="text-xs font-bold text-[#748E63] uppercase tracking-wider ml-1">Bulan</label>
          <input
            type="month"
            value={startDate.slice(0, 7)}
            onChange={(e) => {
              const date = new Date(e.target.value + "-01");
              setStartDate(format(startOfMonth(date), "yyyy-MM-dd"));
              setEndDate(format(endOfMonth(date), "yyyy-MM-dd"));
            }}
            className="w-full h-10 px-3 rounded-2xl border-2 border-[#E5E7EB] bg-white text-slate-700 text-sm font-medium focus:border-[#FFB6C1] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 rounded-3xl p-4 border-2 border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-emerald-500 mb-1">{summary.present}</span>
          <span className="text-xs font-bold text-emerald-700 uppercase">Hadir</span>
        </div>
        <div className="bg-white/80 rounded-3xl p-4 border-2 border-blue-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-blue-500 mb-1">{summary.sick}</span>
          <span className="text-xs font-bold text-blue-700 uppercase">Sakit</span>
        </div>
        <div className="bg-white/80 rounded-3xl p-4 border-2 border-yellow-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-yellow-500 mb-1">{summary.excused}</span>
          <span className="text-xs font-bold text-yellow-700 uppercase">Izin</span>
        </div>
        <div className="bg-white/80 rounded-3xl p-4 border-2 border-red-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-red-500 mb-1">{summary.absent}</span>
          <span className="text-xs font-bold text-red-700 uppercase">Alpa</span>
        </div>
      </div>

      {/* Detail List */}
      <div className="bg-white/80 rounded-3xl border-2 border-white/80 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b-2 border-slate-100 bg-white/50 flex items-center gap-2">
          <CalendarIcon className="text-[#FF85A2]" size={20} />
          <h2 className="font-bold text-slate-700">Rincian Kehadiran</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center items-center flex-col gap-3">
            <Loader2 className="animate-spin text-[#FFB6C1] h-8 w-8" />
            <p className="text-slate-400 text-sm font-medium">Memuat data absensi...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-medium">Belum ada data absensi di bulan ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map(record => (
              <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                <div>
                  <p className="font-bold text-slate-700">{format(new Date(record.date), "dd MMMM yyyy")}</p>
                  {record.note && (
                    <p className="text-xs text-slate-500 mt-1 font-medium">{record.note}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${statusMap[record.status].style}`}>
                  {statusMap[record.status].label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
