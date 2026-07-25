"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  // Get user role and redirect to appropriate dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  revalidatePath("/", "layout");

  switch (profile?.role) {
    case "ADMIN":
      redirect("/admin");
    case "TEACHER":
      redirect("/teacher");
    case "PARENT":
      redirect("/parent");
    default:
      redirect("/");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: "Gagal mengirim email. Pastikan email terdaftar." };
  }

  return { success: "Link reset password telah dikirim ke email Anda." };
}
