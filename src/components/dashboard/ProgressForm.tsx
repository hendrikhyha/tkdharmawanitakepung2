"use client";

import { useEffect, useState } from "react";
import { getStudentProgress, saveStudentProgress } from "@/app/actions/progress";
import { Loader2, Save, CheckCircle2, ImagePlus, X } from "lucide-react";

interface ProgressFormProps {
  activityId: string;
}

interface StudentProgress {
  student: {
    id: string;
    name: string;
    photo: string | null;
  };
  progress: {
    id?: string;
    notes: string;
    photo_url?: string | null;
  } | null;
}

export default function ProgressForm({ activityId }: ProgressFormProps) {
  const [data, setData] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state maps student_id -> notes
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [photoFiles, setPhotoFiles] = useState<Record<string, File | null>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string | null>>({});
  const [existingPhotos, setExistingPhotos] = useState<Record<string, string | null>>({});

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getStudentProgress(activityId);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
        // Initialize form state
        const initialNotes: Record<string, string> = {};
        const initialPhotos: Record<string, string | null> = {};
        res.data.forEach((item) => {
          initialNotes[item.student.id] = item.progress?.notes || "";
          initialPhotos[item.student.id] = item.progress?.photo_url || null;
        });
        setNotes(initialNotes);
        setExistingPhotos(initialPhotos);
      }
      setIsLoading(false);
    }
    loadData();
  }, [activityId]);

  const handleNotesChange = (studentId: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [studentId]: value,
    }));
    setSuccess(false);
  };

  const handlePhotoSelect = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoFiles((prev) => ({ ...prev, [studentId]: file }));
    setPhotoPreviews((prev) => ({ ...prev, [studentId]: preview }));
    setExistingPhotos((prev) => ({ ...prev, [studentId]: null }));
    setSuccess(false);
  };

  const removePhoto = (studentId: string) => {
    setPhotoFiles((prev) => ({ ...prev, [studentId]: null }));
    setPhotoPreviews((prev) => ({ ...prev, [studentId]: null }));
    setExistingPhotos((prev) => ({ ...prev, [studentId]: null }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("activityId", activityId);
    
    Object.entries(notes).forEach(([student_id, value]) => {
      formData.append(`notes_${student_id}`, value);
    });

    Object.entries(photoFiles).forEach(([student_id, file]) => {
      if (file) formData.append(`photo_${student_id}`, file);
    });

    Object.entries(existingPhotos).forEach(([student_id, url]) => {
      if (url) formData.append(`existing_photo_${student_id}`, url);
    });

    const res = await saveStudentProgress(formData);
    
    setIsSaving(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3s
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900 p-8 text-center text-white/50">
        Tidak ada data siswa untuk kelas ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
        <div className="grid grid-cols-[1fr] sm:grid-cols-[250px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {data.map((item: any) => (
            <div key={item.student.id} className="grid grid-cols-[1fr] sm:grid-cols-subgrid sm:col-span-2 border-t border-white/10 first:border-0 hover:bg-white/5 transition-colors">
              {/* Student Info */}
              <div className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 border border-white/5 flex items-center justify-center overflow-hidden">
                  {item.student.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.student.photo} alt={item.student.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white/50">
                      {item.student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="font-medium text-white truncate">
                  {item.student.name}
                </div>
              </div>
              
              {/* Progress Input */}
              <div className="p-4 flex flex-col sm:flex-row gap-4">
                <textarea
                  value={notes[item.student.id] || ""}
                  onChange={(e) => handleNotesChange(item.student.id, e.target.value)}
                  placeholder="Tuliskan catatan perkembangan subyektif siswa untuk kegiatan ini..."
                  className="w-full sm:w-2/3 min-h-[80px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                />

                <div className="w-full sm:w-1/3 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-4 relative overflow-hidden group">
                  {(photoPreviews[item.student.id] || existingPhotos[item.student.id]) ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={photoPreviews[item.student.id] || existingPhotos[item.student.id] || ""} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removePhoto(item.student.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          title="Hapus foto"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="text-white/20 mb-2" size={24} />
                      <span className="text-xs text-white/40 text-center">Tambahkan Foto<br/>(Maks 2MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handlePhotoSelect(item.student.id, e)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-6">
        {success && (
          <span className="flex items-center gap-2 text-sm text-emerald-400 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} />
            Tersimpan
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Simpan Penilaian
        </button>
      </div>
    </div>
  );
}
