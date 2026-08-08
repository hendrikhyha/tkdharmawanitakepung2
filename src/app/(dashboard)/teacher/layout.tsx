import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TeacherShell from "@/components/dashboard/TeacherShell";

import { getTeacherNotifications } from "@/services/teacher";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "TEACHER") {
    redirect("/login");
  }

  const notifications = await getTeacherNotifications(user.id);

  return <TeacherShell user={profile} notifications={notifications}>{children}</TeacherShell>;
}
