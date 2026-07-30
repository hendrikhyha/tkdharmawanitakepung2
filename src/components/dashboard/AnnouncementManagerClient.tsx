"use client";

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsQueryOptions, uploadAnnouncementService } from '@/services/announcements';
import { deleteAnnouncementAction } from '@/app/actions/announcements';
import { Loader2, Upload, Trash2, ImageIcon, AlertCircle } from 'lucide-react';

export default function AnnouncementManagerClient() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: announcements, isLoading } = useQuery(announcementsQueryOptions());

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadAnnouncementService,
    onMutate: async (newFile) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previous = queryClient.getQueryData(['announcements']);
      
      const optimisticAnnouncement = {
        id: Math.random().toString(),
        image_url: URL.createObjectURL(newFile),
        order_index: 0,
        created_at: new Date().toISOString(),
        uploaded_by: 'temp',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(['announcements'], (old: any) => [...(old || []), optimisticAnnouncement]);
      return { previous };
    },
    onError: (err, newFile, context) => {
      queryClient.setQueryData(['announcements'], context?.previous);
      setUploadError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, url }: { id: string, url: string }) => deleteAnnouncementAction(id, url),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previous = queryClient.getQueryData(['announcements']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(['announcements'], (old: any) => old?.filter((a: any) => a.id !== id));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['announcements'], context?.previous);
      alert("Gagal menghapus pengumuman: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (announcements && announcements.length >= 5) {
      setUploadError("Maksimal 5 gambar pengumuman diperbolehkan.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    uploadMutation.mutate(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  const isMaxReached = announcements && announcements.length >= 5;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Kelola Pengumuman</h1>
        <p className="mt-1 text-sm text-white/50">
          Upload banner atau pengumuman yang akan tampil di Dashboard Orang Tua. (Maksimal 5 gambar)
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-emerald-400" size={20} />
            Daftar Pengumuman ({announcements?.length || 0}/5)
          </h2>
          
          <div>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isMaxReached || isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isMaxReached || isUploading}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload Gambar
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <AlertCircle size={16} />
            {uploadError}
          </div>
        )}

        {(!announcements || announcements.length === 0) ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12">
            <ImageIcon className="mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm font-medium text-white/60">Belum ada pengumuman</p>
            <p className="mt-1 text-xs text-white/40">Upload gambar untuk menampilkannya di carousel.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((ann, idx) => (
              <div key={ann.id} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/20 aspect-[24/7] sm:aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={ann.image_url} 
                  alt={`Pengumuman ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin menghapus pengumuman ini?')) {
                        deleteMutation.mutate({ id: ann.id, url: ann.image_url });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
