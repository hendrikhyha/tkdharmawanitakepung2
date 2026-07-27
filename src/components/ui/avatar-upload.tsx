"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadAvatar } from "@/app/actions/master";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  pathPrefix: string; // e.g., 'teachers', 'parents', 'students'
  className?: string;
  fallbackText?: string;
}

export function AvatarUpload({
  value,
  onChange,
  pathPrefix,
  className,
  fallbackText = "?",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Generate a unique path to avoid caching issues when replacing photo
      const uniqueId = Math.random().toString(36).substring(7);
      const ext = file.name.split(".").pop();
      const path = `${pathPrefix}/${uniqueId}.${ext}`;

      const res = await uploadAvatar(formData, path);
      
      if (res.error) {
        alert("Gagal mengunggah foto: " + res.error);
      } else if (res.url) {
        onChange(res.url);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className="h-24 w-24 border-2 border-white/10 bg-slate-900/50">
        <AvatarImage src={value || undefined} className="object-cover" />
        <AvatarFallback className="text-2xl font-semibold bg-white/5 text-white/40">
          {fallbackText.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 shadow-md hover:bg-yellow-300 transition-colors disabled:opacity-50"
        title="Ubah Foto"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
}
