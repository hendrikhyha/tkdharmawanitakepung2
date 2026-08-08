"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSetting(key: string, defaultValue: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) {
    return defaultValue;
  }

  return data.value;
}

export async function updateSetting(key: string, value: any, description: string = "") {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can change settings");
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key, value, description, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    console.error("Error updating setting:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
