import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User, Mail, ShieldCheck, KeyRound, Sparkles } from "lucide-react";

export const metadata = {
  title: "Profil Orang Tua | Jurnal TK",
};

export default async function ParentProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get full profile from users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "PARENT") redirect("/login");

  // Get parent details
  const { data: parent } = await supabase
    .from("parents")
    .select("phone, address")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-sm shadow-emerald-200">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Profil Saya
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Informasi akun dan kontak Anda.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center border-b border-slate-100 pb-8 mb-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-pink-400 to-rose-400 text-4xl font-extrabold text-white shadow-lg shadow-pink-200">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-800">{profile.name}</h2>
            <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1 rounded-xl w-fit">
              <ShieldCheck size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold tracking-wider">ORANG TUA WALI</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Mail size={16} className="text-slate-400" />
                Email
              </label>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-slate-800 font-medium shadow-inner shadow-slate-100/50">
                {profile.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <User size={16} className="text-slate-400" />
                No. HP (WhatsApp)
              </label>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-slate-800 font-medium shadow-inner shadow-slate-100/50">
                {parent?.phone || "-"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <User size={16} className="text-slate-400" />
              Alamat
            </label>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-slate-800 font-medium shadow-inner shadow-slate-100/50">
              {parent?.address || "-"}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">Keamanan Akun</h3>
          <p className="text-sm font-medium text-slate-500 mb-5">
            Untuk mengubah password atau memperbarui data diri secara lengkap, silakan hubungi Guru Kelas atau Administrator sekolah.
          </p>
          <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-400 cursor-not-allowed">
            <KeyRound size={18} />
            Ubah Password (Hubungi Admin)
          </div>
        </div>
      </div>
    </div>
  );
}
