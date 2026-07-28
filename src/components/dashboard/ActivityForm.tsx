"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, ActivityFormValues } from "@/lib/validations/activity";
import { X, Upload, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import imageCompression from "browser-image-compression";

export interface ActivityFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    activity_date: string;
    activity_time: string | null;
    status: "DRAFT" | "PUBLISHED";
    activity_photos: Array<{ id: string; image_url: string }>;
  };
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  isMutating: boolean;
  titleText: string;
}

export default function ActivityForm({
  initialData,
  onSubmit,
  isMutating,
  titleText,
}: ActivityFormProps) {
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]); // holds image URLs
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      activity_date: initialData?.activity_date || new Date().toISOString().split("T")[0],
      activity_time: initialData?.activity_time?.slice(0, 5) || "",
      status: initialData?.status || "DRAFT",
    },
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - (initialData?.activity_photos.length || 0) + photosToDelete.length - newPhotoFiles.length;

    if (files.length > remainingSlots) {
      alert(`Maksimal 5 foto per kegiatan. Anda hanya bisa menambah ${remainingSlots} foto lagi.`);
      return;
    }

    const compressedFiles: File[] = [];
    
    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original file if compression fails but it's under 5MB
        if (file.size <= 5 * 1024 * 1024) {
          compressedFiles.push(file);
        } else {
          alert(`Gagal mengompres dan ukuran asli file ${file.name} melebihi 5MB.`);
        }
      }
    }

    const previews = compressedFiles.map((file) => URL.createObjectURL(file));

    setNewPhotoFiles((prev) => [...prev, ...compressedFiles]);
    setNewPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewPhoto = (index: number) => {
    // Revoke object URL
    URL.revokeObjectURL(newPhotoPreviews[index]);

    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const markExistingPhotoForDeletion = (url: string) => {
    setPhotosToDelete((prev) => [...prev, url]);
  };

  const handleFormSubmit = async (values: ActivityFormValues) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("activity_date", values.activity_date);
    formData.append("activity_time", values.activity_time || "");
    formData.append("status", values.status);

    if (initialData) {
      formData.append("photos_to_delete", JSON.stringify(photosToDelete));
      newPhotoFiles.forEach((file) => formData.append("new_photos", file));
    } else {
      newPhotoFiles.forEach((file) => formData.append("photos", file));
    }

    const res = await onSubmit(formData);
    if (res.error) {
      setServerError(res.error);
    }
  };

  const totalPhotosCount =
    (initialData?.activity_photos.length || 0) - photosToDelete.length + newPhotoFiles.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/activities"
          className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">{titleText}</h1>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/80">Judul Kegiatan</label>
          <input
            {...register("title")}
            placeholder="Contoh: Doa Pagi bersama"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition"
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/80">Deskripsi/Detail Kegiatan</label>
          <textarea
            {...register("description")}
            placeholder="Jelaskan detail aktivitas anak..."
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition resize-none"
          />
        </div>

        {/* Date and Time Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Tanggal</label>
            <input
              type="date"
              {...register("activity_date")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white [color-scheme:dark] outline-none transition focus:border-emerald-500/50 focus:ring-1"
            />
            {errors.activity_date && <p className="text-xs text-red-400">{errors.activity_date.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Waktu (Opsional)</label>
            <input
              type="time"
              {...register("activity_time")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white [color-scheme:dark] outline-none transition focus:border-emerald-500/50 focus:ring-1"
            />
          </div>
        </div>

        {/* Photos Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-white/80">
            Foto Kegiatan ({totalPhotosCount}/5)
          </label>
          
          {/* Uploader Box */}
          {totalPhotosCount < 5 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl py-6 cursor-pointer bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 transition"
            >
              <Upload className="text-white/40 mb-2" size={24} />
              <span className="text-sm font-medium text-white/60">Klik untuk unggah gambar</span>
              <span className="text-xs text-white/40 mt-1">Maksimal 5MB per berkas (Format: JPG, PNG, WEBP)</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {/* Photos Grid Previews */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mt-2">
            {/* Existing Database Photos */}
            {initialData?.activity_photos
              .filter((p) => !photosToDelete.includes(p.image_url))
              .map((p) => (
                <div key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="Pratinjau" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => markExistingPhotoForDeletion(p.image_url)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

            {/* New Selected Photos */}
            {newPhotoPreviews.map((url, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Pratinjau" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status Draft / Published */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/80 font-medium">Status Publikasi</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white/70 cursor-pointer">
              <input
                type="radio"
                value="DRAFT"
                {...register("status")}
                className="accent-emerald-500"
              />
              Draft (Hanya dilihat Guru)
            </label>
            <label className="flex items-center gap-2 text-white/70 cursor-pointer">
              <input
                type="radio"
                value="PUBLISHED"
                {...register("status")}
                className="accent-emerald-500"
              />
              Publish (Dapat dilihat Orang Tua)
            </label>
          </div>
        </div>

        {serverError && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{serverError}</p>}

        <button
          type="submit"
          disabled={isMutating}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {isMutating && <Loader2 size={16} className="animate-spin" />}
          {initialData ? "Simpan Perubahan" : "Buat Jurnal"}
        </button>
      </form>
    </div>
  );
}
