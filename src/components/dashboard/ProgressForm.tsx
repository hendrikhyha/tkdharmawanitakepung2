"use client";

import { useEffect, useState } from "react";
import { getStudentProgress, saveStudentProgress } from "@/app/actions/progress";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

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
        res.data.forEach((item) => {
          initialNotes[item.student.id] = item.progress?.notes || "";
        });
        setNotes(initialNotes);
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

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    // Convert notes object to array
    const progressData = Object.entries(notes).map(([student_id, value]) => ({
      student_id,
      notes: value,
    }));

    const res = await saveStudentProgress(activityId, progressData);
    
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
              <div className="p-4">
                <textarea
                  value={notes[item.student.id] || ""}
                  onChange={(e) => handleNotesChange(item.student.id, e.target.value)}
                  placeholder="Tuliskan catatan perkembangan subyektif siswa untuk kegiatan ini..."
                  className="w-full min-h-[80px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                />
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
