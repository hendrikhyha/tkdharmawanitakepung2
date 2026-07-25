import { z } from "zod";

export const activitySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  activity_time: z.string().regex(/^\d{2}:\d{2}$/, "Waktu tidak valid").or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
