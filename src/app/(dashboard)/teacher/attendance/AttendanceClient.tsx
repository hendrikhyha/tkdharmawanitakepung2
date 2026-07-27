"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Loader2, Save, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAttendanceByDate } from "@/services/attendance";
import { saveDailyAttendance, AttendanceEntry } from "@/app/actions/attendance";

type Student = {
  id: string;
  name: string;
};

type Props = {
  classId: string;
  students: Student[];
};

export default function AttendanceClient({ classId, students }: Props) {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAttendance = useCallback(async (selectedDate: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await getAttendanceByDate(classId, selectedDate);
      const newMap: Record<string, AttendanceEntry> = {};
      
      // Initialize with PRESENT by default if no data exists
      students.forEach(student => {
        newMap[student.id] = {
          student_id: student.id,
          status: "PRESENT",
          note: "",
        };
      });

      // Override with existing data
      data.forEach(record => {
        newMap[record.student_id] = {
          student_id: record.student_id,
          status: record.status,
          note: record.note || "",
        };
      });

      setAttendanceMap(newMap);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal memuat data absensi." });
    } finally {
      setIsLoading(false);
    }
  }, [classId, students]);

  useEffect(() => {
    fetchAttendance(date);
  }, [date, fetchAttendance]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "SICK" | "EXCUSED" | "ABSENT") => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    const entries = Object.values(attendanceMap);
    const res = await saveDailyAttendance(date, entries);
    
    setIsSaving(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Absensi berhasil disimpan!" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const statusOptions = [
    { value: "PRESENT", label: "Hadir", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" },
    { value: "SICK", label: "Sakit", color: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" },
    { value: "EXCUSED", label: "Izin", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20" },
    { value: "ABSENT", label: "Alpa", color: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="space-y-2 w-full max-w-xs">
          <Label htmlFor="date" className="text-white/80">Tanggal Absensi</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 border-white/10 bg-slate-900 text-white focus-visible:ring-emerald-400/30 [color-scheme:dark]"
            />
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Simpan Absensi
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {message.type === "success" && <CheckCircle2 size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center flex-col gap-3">
            <Loader2 className="animate-spin text-white/40 h-8 w-8" />
            <p className="text-white/40 text-sm">Memuat data absensi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-white/60">
                <tr>
                  <th className="p-4 font-medium">Nama Siswa</th>
                  <th className="p-4 font-medium min-w-[320px]">Status Kehadiran</th>
                  <th className="p-4 font-medium">Keterangan (Opsional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || "PRESENT";
                  const currentNote = attendanceMap[student.id]?.note || "";

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{student.name}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((opt) => {
                            const isSelected = currentStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(student.id, opt.value as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  isSelected 
                                    ? `${opt.color.split(" ")[0]} ${opt.color.split(" ")[1]} border-transparent ring-2 ring-offset-2 ring-offset-slate-900 ring-${opt.color.split(" ")[1].split("-")[1]}-500/50` 
                                    : "bg-transparent text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <Input 
                          placeholder="Catatan..." 
                          value={currentNote}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="h-8 border-white/10 bg-slate-900/50 text-white text-xs focus-visible:ring-emerald-400/30"
                        />
                      </td>
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
