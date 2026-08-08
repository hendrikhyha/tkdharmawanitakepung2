"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Loader2, Calendar as CalendarIcon, FileSpreadsheet, Download, Printer } from "lucide-react";
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    setStartDate(`${year}-${String(month).padStart(2, "0")}-01`);
    setEndDate(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);
  };

  const handleMonthChange = (monthStr: string) => {
    if (!monthStr) return;
    const [year, month] = monthStr.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    setStartDate(`${year}-${String(month).padStart(2, "0")}-01`);
    setEndDate(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);
  };

  // Process data for the table
  const totalDaysInRange = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const processedData = useMemo(() => {
    const report: Record<string, { present: number, sick: number, excused: number, absent: number, holiday: number, unfilled: number, total: number }> = {};
    
    // Initialize
    students.forEach(s => {
      report[s.id] = { present: 0, sick: 0, excused: 0, absent: 0, holiday: 0, unfilled: 0, total: totalDaysInRange };
    });

    // Populate
    records.forEach(r => {
      if (report[r.student_id]) {
        report[r.student_id].total++;
        if (r.status === "PRESENT") report[r.student_id].present++;
        else if (r.status === "SICK") report[r.student_id].sick++;
        else if (r.status === "EXCUSED") report[r.student_id].excused++;
        else if (r.status === "ABSENT") report[r.student_id].absent++;
        else if (r.status === "HOLIDAY") report[r.student_id].holiday++;
      }
    });

    // Calculate unfilled
    Object.values(report).forEach(r => {
      r.unfilled = Math.max(0, totalDaysInRange - (r.present + r.sick + r.excused + r.absent + r.holiday));
    });

    return report;
  }, [records, students, totalDaysInRange]);

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Absensi");

      // Title & Header info
      worksheet.mergeCells("A1:H1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `REKAPITULASI ABSENSI`;
      titleCell.font = { bold: true, size: 16, color: { argb: "FF1E293B" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.addRow([]);
      worksheet.addRow(["Periode:", `${startDate} s/d ${endDate}`]);
      worksheet.addRow([]);

      // Header row
      const headerRowIndex = 5;
      const headerRow = worksheet.getRow(headerRowIndex);
      headerRow.values = ["No", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpa", "Libur", "Belum Diisi", "Total Hari"];
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headerRow.eachCell((cell: any) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF059669" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      worksheet.columns = [
        { key: "no", width: 6 },
        { key: "nama", width: 30 },
        { key: "hadir", width: 10 },
        { key: "sakit", width: 10 },
        { key: "izin", width: 10 },
        { key: "alpa", width: 10 },
        { key: "libur", width: 10 },
        { key: "belum_diisi", width: 12 },
        { key: "total", width: 12 },
      ];

      // Rows
      let currentRowIndex = 6;
      students.forEach((student, i) => {
        const data = processedData[student.id];
        const row = worksheet.getRow(currentRowIndex);
        row.values = [i + 1, student.name, data.present, data.sick, data.excused, data.absent, data.holiday, data.unfilled, data.total];
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(4).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "center" };
        row.getCell(8).alignment = { horizontal: "center" };
        row.getCell(9).alignment = { horizontal: "center" };
        currentRowIndex++;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rekap_Absensi_${startDate}_${endDate}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      handleDownloadCSV();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ["No", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpa", "Libur", "Belum Diisi", "Total Hari"];
    const rows = students.map((s, i) => {
      const data = processedData[s.id];
      return [
        i + 1,
        `"${s.name}"`,
        data.present,
        data.sick,
        data.excused,
        data.absent,
        data.holiday,
        data.unfilled,
        data.total
      ];
    });

    const csvContent = "\uFEFF" + [
      `REKAPITULASI ABSENSI`,
      `Periode: ${startDate} s/d ${endDate}`,
      ``,
      headers.join(";"),
      ...rows.map(r => r.join(";"))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Absensi_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="selectMonth" className="text-white/80">Pilih Bulan</Label>
            <Input 
              id="selectMonth" 
              type="month" 
              value={startDate.slice(0, 7)}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="border-white/10 bg-slate-900 text-white focus-visible:ring-blue-400/30 [color-scheme:dark]"
            />
          </div>
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

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportExcel}
          disabled={isLoading || students.length === 0}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition shadow-sm disabled:opacity-50"
        >
          <FileSpreadsheet size={18} />
          Ekspor Excel (.xlsx)
        </button>
        <button
          onClick={handleDownloadCSV}
          disabled={isLoading || students.length === 0}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition disabled:opacity-50"
        >
          <Download size={16} />
          Unduh CSV
        </button>
        <button
          onClick={handlePrint}
          disabled={isLoading || students.length === 0}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition disabled:opacity-50"
        >
          <Printer size={16} />
          Cetak / PDF
        </button>
      </div>

      <div id="printable-report" className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden print:bg-white print:text-black print:border-gray-200 print:rounded-none print:shadow-none">
        
        {/* Print Header */}
        <div className="hidden print:block text-center p-6 pb-4">
          <h2 className="text-xl font-bold text-black">REKAPITULASI ABSENSI</h2>
          <h3 className="text-lg font-semibold text-gray-700 mt-1">TK Dharma Wanita Kepung 2</h3>
          <p className="mt-2 text-sm text-gray-500">Periode: {startDate} s/d {endDate}</p>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center flex-col gap-3">
            <Loader2 className="animate-spin text-white/40 h-8 w-8" />
            <p className="text-white/40 text-sm">Menghitung rekap...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-white/60 print:bg-gray-100 print:text-gray-700">
                <tr>
                  <th className="p-4 font-medium print:border-b print:border-gray-300">Nama Siswa</th>
                  <th className="p-4 font-medium text-center text-emerald-400 print:text-emerald-700 print:border-b print:border-gray-300">Hadir</th>
                  <th className="p-4 font-medium text-center text-blue-400 print:text-blue-700 print:border-b print:border-gray-300">Sakit</th>
                  <th className="p-4 font-medium text-center text-yellow-400 print:text-yellow-700 print:border-b print:border-gray-300">Izin</th>
                  <th className="p-4 font-medium text-center text-red-400 print:text-red-700 print:border-b print:border-gray-300">Alpa</th>
                  <th className="p-4 font-medium text-center text-purple-400 print:text-purple-700 print:border-b print:border-gray-300">Libur</th>
                  <th className="p-4 font-medium text-center text-slate-400 print:text-slate-600 print:border-b print:border-gray-300">Kosong</th>
                  <th className="p-4 font-medium text-center print:border-b print:border-gray-300">Total Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {students.map((student) => {
                  const data = processedData[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                      <td className="p-4 font-medium text-white print:text-black">{student.name}</td>
                      <td className="p-4 text-center font-bold text-emerald-400 print:text-emerald-700">{data.present}</td>
                      <td className="p-4 text-center font-bold text-blue-400 print:text-blue-700">{data.sick}</td>
                      <td className="p-4 text-center font-bold text-yellow-400 print:text-yellow-700">{data.excused}</td>
                      <td className="p-4 text-center font-bold text-red-400 print:text-red-700">{data.absent}</td>
                      <td className="p-4 text-center font-bold text-purple-400 print:text-purple-700">{data.holiday}</td>
                      <td className="p-4 text-center font-bold text-slate-400 print:text-slate-500">{data.unfilled > 0 ? data.unfilled : '-'}</td>
                      <td className="p-4 text-center text-white/60 font-semibold print:text-gray-600">{data.total}</td>
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
