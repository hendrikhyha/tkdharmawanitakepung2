import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ParentShell from "@/components/dashboard/ParentShell";

export default async function ParentLayout({
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

  if (!profile || profile.role !== "PARENT") {
    redirect("/login");
  }

  return <ParentShell user={profile}>{children}</ParentShell>;
}
