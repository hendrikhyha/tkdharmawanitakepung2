"use server";

import { getReportData, ReportData } from "@/services/reports";
import { createClient } from "@/utils/supabase/server";

export async function fetchReportData(
  type: "daily" | "weekly" | "monthly",
  dateStr: string
): Promise<{ data?: ReportData; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const reportData = await getReportData(user.id, type, dateStr);

    if (!reportData) return { error: "Data guru atau kelas tidak ditemukan" };

    return { data: reportData };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
