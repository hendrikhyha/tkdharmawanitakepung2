"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  FileText,
  Download,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Image as ImageIcon,
} from "lucide-react";
import { fetchReportData } from "@/app/actions/reports";
import { ReportData } from "@/services/reports";
import { Input } from "@/components/ui/input";

type ReportType = "daily" | "weekly" | "monthly";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    const res = await fetchReportData(reportType, selectedDate);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setReportData(res.data);
    }

    setIsLoading(false);
  };

  const handleExportExcel = async () => {
    if (!reportData) return;
    setIsLoading(true);
    setError(null);

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Kegiatan");

      // Title & Header info
      worksheet.mergeCells("A1:E1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `LAPORAN KEGIATAN ${reportType.toUpperCase()}`;
      titleCell.font = { bold: true, size: 16, color: { argb: "FF1E293B" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("A2:E2");
      const subTitleCell = worksheet.getCell("A2");
      subTitleCell.value = "TK DHARMA WANITA KEPUNG 2";
      subTitleCell.font = { bold: true, size: 12, color: { argb: "FF059669" } };
      subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.addRow([]);
      worksheet.addRow(["Kelas:", reportData.className]);
      worksheet.addRow(["Guru:", reportData.teacherName]);
      worksheet.addRow(["Tahun Ajaran:", reportData.academicYear]);
      worksheet.addRow(["Periode:", reportData.period]);
      worksheet.addRow([]);

      // Header row
      const headerRowIndex = 9;
      const headerRow = worksheet.getRow(headerRowIndex);
      headerRow.values = ["No", "Tanggal", "Kegiatan", "Keterangan", "Gambar Foto"];
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.height = 25;
      headerRow.eachCell((cell: any) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF059669" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Set column widths
      worksheet.columns = [
        { key: "no", width: 6 },
        { key: "tanggal", width: 22 },
        { key: "kegiatan", width: 28 },
        { key: "keterangan", width: 40 },
        { key: "gambar", width: 36 },
      ];

      // Rows
      let currentRowIndex = 10;

      for (let i = 0; i < reportData.activities.length; i++) {
        const a = reportData.activities[i];
        const dateStr = `${format(new Date(a.activity_date), "d MMMM yyyy", { locale: idLocale })}${
          a.activity_time ? ` ${a.activity_time.slice(0, 5)}` : ""
        }`;

        const hasPhotos = a.activity_photos && a.activity_photos.length > 0;
        const row = worksheet.getRow(currentRowIndex);
        row.values = [i + 1, dateStr, a.title, a.description || "-", hasPhotos ? "" : "Tidak ada gambar"];
        row.height = hasPhotos ? 70 : 35;

        // Alignment & wrap text
        row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        row.getCell(3).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        row.getCell(4).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        row.getCell(5).alignment = { vertical: "middle", horizontal: "center" };

        // Embed photos into Excel cell
        if (hasPhotos) {
          let photoIndex = 0;
          for (const photo of a.activity_photos.slice(0, 3)) {
            try {
              const response = await fetch(photo.image_url);
              const arrayBuffer = await response.arrayBuffer();

              let extension: "png" | "jpeg" = "jpeg";
              if (photo.image_url.toLowerCase().endsWith(".png")) {
                extension = "png";
              }

              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: extension,
              });

              worksheet.addImage(imageId, {
                tl: { col: 4 + photoIndex * 0.35, row: currentRowIndex - 1 + 0.1 },
                ext: { width: 75, height: 60 },
              });
              photoIndex++;
            } catch (err) {
              console.error("Gagal menyisipkan gambar ke Excel:", err);
            }
          }
        }

        currentRowIndex++;
      }

      // Write buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_${reportType}_${reportData.className}_${reportData.period}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel generation error:", err);
      setError("Terjadi kesalahan saat mengekspor Excel. Mencoba mengunduh CSV...");
      handleDownloadCSV();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reportData) return;

    const headers = ["No", "Tanggal", "Kegiatan", "Keterangan", "Gambar (URL)"];
    const rows = reportData.activities.map((a, i) => [
      i + 1,
      `"${format(new Date(a.activity_date), "d MMMM yyyy", { locale: idLocale })}${a.activity_time ? ` ${a.activity_time.slice(0, 5)}` : ""}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${(a.description || "-").replace(/"/g, '""')}"`,
      `"${(a.activity_photos?.map((p) => p.image_url).join(" ; ") || "-").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [
        `LAPORAN KEGIATAN ${reportType.toUpperCase()}`,
        `Sekolah: TK Dharma Wanita Kepung 2`,
        `Kelas: ${reportData.className}`,
        `Guru: ${reportData.teacherName}`,
        `Tahun Ajaran: ${reportData.academicYear}`,
        `Periode: ${reportData.period}`,
        ``,
        headers.join(";"),
        ...rows.map((r) => r.join(";")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_${reportType}_${reportData.className}_${reportData.period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTypes: { value: ReportType; label: string }[] = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Laporan Kegiatan
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Generate dan ekspor laporan kegiatan harian, mingguan, atau bulanan ke Spreadsheet / PDF.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
        {/* Report Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/80">
            Tipe Laporan
          </label>
          <div className="flex gap-2">
            {reportTypes.map((rt) => (
              <button
                key={rt.value}
                onClick={() => setReportType(rt.value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  reportType === rt.value
                    ? "bg-emerald-500 text-white"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 max-w-xs">
          <Calendar className="text-emerald-400 shrink-0" size={20} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30 [color-scheme:dark]"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          Generate Laporan
        </button>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
            >
              <FileSpreadsheet size={18} />
              Ekspor Excel (.xlsx)
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
            >
              <Download size={16} />
              Unduh CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
            >
              <Printer size={16} />
              Cetak / PDF
            </button>
          </div>

          {/* Print-Friendly Report */}
          <div
            id="printable-report"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm print:bg-white print:text-black print:border-gray-200 print:rounded-none print:shadow-none"
          >
            {/* Report Header */}
            <div className="text-center mb-6 print:mb-8">
              <h2 className="text-xl font-bold text-white print:text-black">
                LAPORAN KEGIATAN {reportType === "daily" ? "HARIAN" : reportType === "weekly" ? "MINGGUAN" : "BULANAN"}
              </h2>
              <h3 className="text-lg font-semibold text-emerald-400 print:text-gray-700 mt-1">
                TK Dharma Wanita Kepung 2
              </h3>
              <div className="mt-3 text-sm text-white/60 print:text-gray-500 space-y-0.5">
                <p>Kelas: <strong className="text-white print:text-black">{reportData.className}</strong></p>
                <p>Guru: <strong className="text-white print:text-black">{reportData.teacherName}</strong></p>
                <p>Tahun Ajaran: <strong className="text-white print:text-black">{reportData.academicYear}</strong></p>
                <p>Periode: <strong className="text-white print:text-black">{reportData.period}</strong></p>
              </div>
            </div>

            {/* Activities Table */}
            {reportData.activities.length === 0 ? (
              <div className="text-center py-8 text-white/40 print:text-gray-400">
                Tidak ada kegiatan pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 print:border-gray-300">
                      <th className="py-3 px-3 text-left text-white/60 print:text-gray-600 font-semibold w-12">
                        No
                      </th>
                      <th className="py-3 px-3 text-left text-white/60 print:text-gray-600 font-semibold w-36">
                        Tanggal
                      </th>
                      <th className="py-3 px-3 text-left text-white/60 print:text-gray-600 font-semibold w-48">
                        Kegiatan
                      </th>
                      <th className="py-3 px-3 text-left text-white/60 print:text-gray-600 font-semibold">
                        Keterangan
                      </th>
                      <th className="py-3 px-3 text-left text-white/60 print:text-gray-600 font-semibold w-52">
                        Gambar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.activities.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className="border-b border-white/5 print:border-gray-200 hover:bg-white/5 print:hover:bg-transparent"
                      >
                        <td className="py-3 px-3 text-white/70 print:text-gray-700 font-medium align-top">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3 text-white/70 print:text-gray-700 align-top whitespace-nowrap">
                          <div>
                            {format(new Date(activity.activity_date), "d MMM yyyy", { locale: idLocale })}
                          </div>
                          {activity.activity_time && (
                            <div className="text-xs text-white/40 print:text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock size={11} className="print:hidden" />
                              {activity.activity_time.slice(0, 5)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-white print:text-black align-top">
                          {activity.title}
                        </td>
                        <td className="py-3 px-3 text-white/70 print:text-gray-700 align-top leading-relaxed">
                          {activity.description || "-"}
                        </td>
                        <td className="py-3 px-3 align-top">
                          {activity.activity_photos && activity.activity_photos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {activity.activity_photos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="h-14 w-20 rounded-lg overflow-hidden border border-white/10 print:border-gray-300 bg-black/20 shrink-0"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={photo.image_url}
                                    alt="Foto Kegiatan"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-white/30 print:text-gray-400 font-normal">
                              <ImageIcon size={14} />
                              Tidak ada gambar
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 print:border-gray-300 flex justify-between text-xs text-white/40 print:text-gray-500">
              <span>
                Total Kegiatan: {reportData.activities.length}
              </span>
              <span>
                Dicetak pada: {format(new Date(), "d MMMM yyyy, HH:mm", { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

