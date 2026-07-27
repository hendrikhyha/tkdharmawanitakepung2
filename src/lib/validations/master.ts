import { z } from "zod";

// --- TEACHER & PARENT (Users) ---
export const userSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  password: z.string().optional(),
  avatar_url: z.string().optional().nullable(),
});

// For update, we don't always need to change the email.
export const userUpdateSchema = userSchema.partial();

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type UserFormValues = z.infer<typeof userSchema>;
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;


// --- CLASS ---
export const classSchema = z.object({
  name: z.string().min(2, "Nama kelas minimal 2 karakter"),
  teacher_id: z.string().uuid("Pilih guru").optional().nullable(),
  academic_year_id: z.string().uuid("Pilih tahun ajaran").optional().nullable(),
});

export type ClassFormValues = z.infer<typeof classSchema>;


// --- STUDENT ---
export const studentSchema = z.object({
  name: z.string().min(3, "Nama siswa minimal 3 karakter"),
  class_id: z.string().uuid("Pilih kelas").optional().nullable(),
  parent_id: z.string().uuid("Pilih orang tua").optional().nullable(),
  birth_date: z.string().optional().nullable(), // ISO string YYYY-MM-DD
  photo: z.string().optional().nullable(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
