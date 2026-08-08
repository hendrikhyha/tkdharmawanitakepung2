"use client";

import { useState } from "react";
import { updateSetting } from "@/app/actions/settings";
import { Check, Loader2, Save } from "lucide-react";

export default function SettingsClient({
  initialStrictNotifications,
}: {
  initialStrictNotifications: boolean;
}) {
  const [strictNotifications, setStrictNotifications] = useState(initialStrictNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateSetting(
        "strict_notifications",
        strictNotifications,
        "Jika true, guru tidak dapat menutup (dismiss) notifikasi tugas wajib hingga tugas dikerjakan."
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Gagal menyimpan pengaturan");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white">Notifikasi Guru</h3>
        <p className="text-sm text-white/60">
          Atur bagaimana notifikasi ditampilkan di dashboard guru.
        </p>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-6 items-center">
          <input
            id="strictNotifications"
            type="checkbox"
            checked={strictNotifications}
            onChange={(e) => setStrictNotifications(e.target.checked)}
            className="h-5 w-5 rounded border-white/10 bg-slate-900/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="strictNotifications" className="font-medium text-white">
            Notifikasi Peringatan Permanen
          </label>
          <p className="mt-1 text-sm text-white/50 leading-relaxed">
            Jika diaktifkan, notifikasi peringatan tugas wajib (seperti mengisi absen atau membuat jurnal harian)
            tidak akan bisa ditutup secara manual oleh guru. Notifikasi baru akan hilang setelah tugas tersebut diselesaikan.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-white/10 pt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Simpan Pengaturan
        </button>

        {success && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 animate-in fade-in">
            <Check size={16} />
            Tersimpan
          </span>
        )}
      </div>
    </div>
  );
}
