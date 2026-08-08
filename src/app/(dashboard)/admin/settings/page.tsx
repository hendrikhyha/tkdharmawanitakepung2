import { getSetting } from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Pengaturan Sistem | Admin Jurnal TK",
};

export default async function SettingsPage() {
  const strictNotifications = await getSetting("strict_notifications", true);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Kelola konfigurasi dan perilaku aplikasi.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
        <SettingsClient initialStrictNotifications={strictNotifications} />
      </div>
    </div>
  );
}
