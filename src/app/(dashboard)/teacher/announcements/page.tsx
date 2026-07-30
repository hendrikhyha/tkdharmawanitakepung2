import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnnouncementManagerClient from "@/components/dashboard/AnnouncementManagerClient";

export const metadata = {
  title: "Kelola Pengumuman | Jurnal TK",
};

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!teacher) {
    return <div className="p-8 text-white">Anda tidak memiliki akses (Bukan Guru).</div>;
  }

  return <AnnouncementManagerClient />;
}
