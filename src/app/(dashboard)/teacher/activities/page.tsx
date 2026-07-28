"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  useActivities,
  useReorderActivities,
  usePublishActivity,
  useDeleteActivity,
  ActivityData,
} from "@/hooks/useActivities";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ActivitiesPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const { data: activities, isLoading, error } = useActivities(selectedDate);
  const reorderMutation = useReorderActivities();
  const publishMutation = usePublishActivity();
  const deleteMutation = useDeleteActivity();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sorting handlers
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (!activities) return;
    const newActivities = [...activities];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= activities.length) return;

    // Swap
    const temp = newActivities[index];
    newActivities[index] = newActivities[targetIndex];
    newActivities[targetIndex] = temp;

    const orderedIds = newActivities.map((a) => a.id);
    await reorderMutation.mutateAsync({ orderedIds, date: selectedDate });
  };

  const handleTogglePublish = async (activity: ActivityData) => {
    const nextStatus = activity.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await publishMutation.mutateAsync({
      id: activity.id,
      status: nextStatus,
      date: selectedDate,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync({ id: deleteId, date: selectedDate });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Jurnal Kegiatan
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Kelola lini masa kegiatan harian anak-anak di kelas Anda.
          </p>
        </div>
        <Link
          href="/teacher/activities/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          Buat Jurnal
        </Link>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 max-w-sm">
        <Calendar className="text-emerald-400 shrink-0" size={20} />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border-none bg-transparent p-0 text-white focus-visible:ring-0 [color-scheme:dark]"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : error ? (
        <div className="text-red-400">Gagal memuat data kegiatan harian.</div>
      ) : activities?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-white/20 mb-4" />
          <p className="text-sm font-medium text-white/60">Tidak ada kegiatan terjadwal</p>
          <p className="mt-1 text-xs text-white/40">
            Tambahkan kegiatan untuk menginformasikan perkembangan anak ke Orang Tua.
          </p>
          <Link
            href="/teacher/activities/new"
            className="mt-4 inline-flex text-sm text-emerald-400 hover:underline"
          >
            Buat jurnal baru sekarang
          </Link>
        </div>
      ) : (
        <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
          {activities?.map((activity, index) => (
            <div
              key={activity.id}
              className="relative group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-colors"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-6 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border-2 border-emerald-400" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {activity.activity_time ? activity.activity_time.slice(0, 5) : "TBD"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium border ${
                        activity.status === "PUBLISHED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-white/5 text-white/40 border-white/5"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white leading-tight">
                    {activity.theme}
                  </h3>
                  {activity.sub_theme && activity.sub_theme !== "-" && (
                    <p className="mt-1 text-sm font-medium text-emerald-400">
                      {activity.sub_theme}
                    </p>
                  )}
                  {activity.description && (
                    <p className="mt-2 text-sm text-white/60 line-clamp-3">
                      {activity.description}
                    </p>
                  )}
                </div>

                {/* Actions & Ordering */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Ordering arrows */}
                  <div className="flex flex-col gap-1 mr-2">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0 || reorderMutation.isPending}
                      className="p-1 rounded-md text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
                      title="Pindahkan ke atas"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === activities.length - 1 || reorderMutation.isPending}
                      className="p-1 rounded-md text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20 transition"
                      title="Pindahkan ke bawah"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  {/* General Actions */}
                  <button
                    onClick={() => handleTogglePublish(activity)}
                    className={`rounded-xl p-2 transition border ${
                      activity.status === "PUBLISHED"
                        ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                        : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    title={activity.status === "PUBLISHED" ? "Ubah ke Draft" : "Terbitkan (Publish)"}
                  >
                    {activity.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  
                  <Link
                    href={`/teacher/activities/${activity.id}/progress`}
                    className="rounded-xl border border-indigo-500/20 p-2 text-indigo-400 hover:bg-indigo-500/10 transition"
                    title="Penilaian Perkembangan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/></svg>
                  </Link>

                  <Link
                    href={`/teacher/activities/edit/${activity.id}`}
                    className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
                    title="Edit Kegiatan"
                  >
                    <Edit size={16} />
                  </Link>

                  <button
                    onClick={() => setDeleteId(activity.id)}
                    className="rounded-xl border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10 transition"
                    title="Hapus"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Photos Preview */}
              {activity.activity_photos && activity.activity_photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {activity.activity_photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image_url}
                        alt="Aktivitas Siswa"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kegiatan</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Apakah Anda yakin ingin menghapus jurnal kegiatan ini? Foto yang diunggah juga akan dihapus dari penyimpanan cloud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
