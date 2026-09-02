"use client";

import { useEffect, useState } from "react";
import { getStudentProgress, saveSingleStudentProgress } from "@/app/actions/progress";
import { Loader2, Save, CheckCircle2, ImagePlus, X } from "lucide-react";
import imageCompression from "browser-image-compression";

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
    items?: { notes: string; photo_url?: string | null }[];
  } | null;
}

export default function ProgressForm({ activityId }: ProgressFormProps) {
  const [data, setData] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-student loading and success states
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  // Form state maps student_id -> array of 5 items
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [photoFiles, setPhotoFiles] = useState<Record<string, (File | null)[]>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, (string | null)[]>>({});
  const [existingPhotos, setExistingPhotos] = useState<Record<string, (string | null)[]>>({});
  
  // Active tab per student (0 to 4)
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getStudentProgress(activityId);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
        // Initialize form state with 5 slots
        const initialNotes: Record<string, string[]> = {};
        const initialPhotos: Record<string, (string | null)[]> = {};
        const initialTabs: Record<string, number> = {};
        
        res.data.forEach((item) => {
          initialNotes[item.student.id] = ["", "", "", "", ""];
          initialPhotos[item.student.id] = [null, null, null, null, null];
          initialTabs[item.student.id] = 0;
          
          if (item.progress?.items) {
            item.progress.items.forEach((slot: { notes: string; photo_url?: string | null }, index: number) => {
              if (index < 5) {
                initialNotes[item.student.id][index] = slot.notes || "";
                initialPhotos[item.student.id][index] = slot.photo_url || null;
              }
            });
          }
        });
        setNotes(initialNotes);
        setExistingPhotos(initialPhotos);
        setActiveTabs(initialTabs);
      }
      setIsLoading(false);
    }
    loadData();
  }, [activityId]);

  const handleNotesChange = (studentId: string, index: number, value: string) => {
    setNotes((prev) => {
      const newNotes = [...(prev[studentId] || ["", "", "", "", ""])];
      newNotes[index] = value;
      return { ...prev, [studentId]: newNotes };
    });
    setSuccess((prev) => ({ ...prev, [studentId]: false }));
  };

  const handlePhotoSelect = async (studentId: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let compressedFile = file;
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      compressedFile = await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      if (file.size > 2 * 1024 * 1024) {
        alert("Gagal mengompres dan ukuran asli foto melebihi 2MB");
        return;
      }
    }

    const preview = URL.createObjectURL(compressedFile);
    
    setPhotoFiles((prev) => {
      const newFiles = [...(prev[studentId] || [null, null, null, null, null])];
      newFiles[index] = compressedFile;
      return { ...prev, [studentId]: newFiles };
    });
    
    setPhotoPreviews((prev) => {
      const newPreviews = [...(prev[studentId] || [null, null, null, null, null])];
      newPreviews[index] = preview;
      return { ...prev, [studentId]: newPreviews };
    });
    
    setExistingPhotos((prev) => {
      const newExisting = [...(prev[studentId] || [null, null, null, null, null])];
      newExisting[index] = null;
      return { ...prev, [studentId]: newExisting };
    });
    
    setSuccess((prev) => ({ ...prev, [studentId]: false }));
  };

  const removePhoto = (studentId: string, index: number) => {
    setPhotoFiles((prev) => {
      const newFiles = [...(prev[studentId] || [null, null, null, null, null])];
      newFiles[index] = null;
      return { ...prev, [studentId]: newFiles };
    });
    
    setPhotoPreviews((prev) => {
      const newPreviews = [...(prev[studentId] || [null, null, null, null, null])];
      newPreviews[index] = null;
      return { ...prev, [studentId]: newPreviews };
    });
    
    setExistingPhotos((prev) => {
      const newExisting = [...(prev[studentId] || [null, null, null, null, null])];
      newExisting[index] = null;
      return { ...prev, [studentId]: newExisting };
    });
    
    setSuccess((prev) => ({ ...prev, [studentId]: false }));
  };

  const handleSaveSingle = async (studentId: string) => {
    setIsSaving((prev) => ({ ...prev, [studentId]: true }));
    setError(null);
    setSuccess((prev) => ({ ...prev, [studentId]: false }));

    const formData = new FormData();
    formData.append("activityId", activityId);
    formData.append("studentId", studentId);
    
    for (let i = 0; i < 5; i++) {
      const note = notes[studentId]?.[i];
      if (note) formData.append(`notes_${i}`, note);
      
      const file = photoFiles[studentId]?.[i];
      if (file) formData.append(`photo_${i}`, file);
      
      const existing = existingPhotos[studentId]?.[i];
      if (existing) formData.append(`existing_photo_${i}`, existing);
    }

    const res = await saveSingleStudentProgress(formData);
    
    setIsSaving((prev) => ({ ...prev, [studentId]: false }));
    
    if (res.error) {
      alert(`Gagal menyimpan data murid: ${res.error}`);
    } else {
      setSuccess((prev) => ({ ...prev, [studentId]: true }));
      setTimeout(() => {
        setSuccess((prev) => ({ ...prev, [studentId]: false }));
      }, 3000);
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
                
                <div className="ml-auto flex items-center gap-2">
                  {success[item.student.id] && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 animate-in fade-in">
                      <CheckCircle2 size={14} />
                      Tersimpan
                    </span>
                  )}
                  <button
                    onClick={() => handleSaveSingle(item.student.id)}
                    disabled={isSaving[item.student.id]}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving[item.student.id] ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Simpan
                  </button>
                </div>
              </div>
              
              {/* Progress Input with Tabs */}
              <div className="p-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                  {[0, 1, 2, 3, 4].map((slotIndex) => {
                    const isActive = activeTabs[item.student.id] === slotIndex;
                    const hasData = 
                      (notes[item.student.id]?.[slotIndex] && notes[item.student.id][slotIndex].trim() !== "") || 
                      photoFiles[item.student.id]?.[slotIndex] || 
                      existingPhotos[item.student.id]?.[slotIndex];
                    
                    return (
                      <button
                        key={slotIndex}
                        onClick={() => setActiveTabs((prev) => ({ ...prev, [item.student.id]: slotIndex }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : hasData
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        Slot {slotIndex + 1}
                        {hasData && !isActive && <CheckCircle2 size={12} className="ml-1 opacity-70" />}
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content */}
                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-200">
                  <textarea
                    value={notes[item.student.id]?.[activeTabs[item.student.id] || 0] || ""}
                    onChange={(e) => handleNotesChange(item.student.id, activeTabs[item.student.id] || 0, e.target.value)}
                    placeholder={`Tuliskan catatan perkembangan untuk Slot ${((activeTabs[item.student.id] || 0) + 1)}... (Opsional)`}
                    className="w-full sm:w-2/3 min-h-[80px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                  />

                  <div className="w-full sm:w-1/3 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 p-4 relative overflow-hidden group">
                    {(photoPreviews[item.student.id]?.[activeTabs[item.student.id] || 0] || existingPhotos[item.student.id]?.[activeTabs[item.student.id] || 0]) ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photoPreviews[item.student.id]?.[activeTabs[item.student.id] || 0] || existingPhotos[item.student.id]?.[activeTabs[item.student.id] || 0] || ""} 
                          alt="Preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removePhoto(item.student.id, activeTabs[item.student.id] || 0)}
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
                          onChange={(e) => handlePhotoSelect(item.student.id, activeTabs[item.student.id] || 0, e)}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
