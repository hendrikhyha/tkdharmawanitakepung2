import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { User, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Profil Guru | Jurnal TK",
};

export default async function TeacherProfilePage() {
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

  if (!profile || profile.role !== "TEACHER") redirect("/login");

  // Get teacher details
  const { data: teacher } = await supabase
    .from("teachers")
    .select("phone")
    .eq("user_id", user.id)
    .single();

  async function handleAvatarChange(url: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("users").update({ avatar_url: url }).eq("id", user!.id);
    revalidatePath("/teacher/profile");
    revalidatePath("/teacher"); // also update header
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Informasi akun dan data diri Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center border-b border-white/10 pb-8 mb-8">
          <div className="flex-shrink-0">
            <AvatarUpload
              value={profile.avatar_url}
              onChange={handleAvatarChange}
              pathPrefix="teachers"
              fallbackText={profile.name}
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={16} />
              <span className="text-sm font-medium">GURU KELAS</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/60">
                <Mail size={16} />
                Email
              </label>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                {profile.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/60">
                <User size={16} />
                No. HP (WhatsApp)
              </label>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">
                {teacher?.phone || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Keamanan Akun</h3>
          <p className="text-sm text-white/60 mb-4">
            Untuk mengubah password atau memperbarui data diri secara lengkap, silakan hubungi Administrator sekolah.
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40 cursor-not-allowed">
            <KeyRound size={16} />
            Ubah Password (Hubungi Admin)
          </div>
        </div>
      </div>
    </div>
  );
}
