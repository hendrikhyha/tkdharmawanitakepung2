"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  UserFormValues,
  ClassFormValues,
  StudentFormValues,
  UserUpdateFormValues,
} from "@/lib/validations/master";

// ----------------------------------------------------------------------
// TEACHERS
// ----------------------------------------------------------------------

export async function createTeacher(data: UserFormValues) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const initialPassword = data.password && data.password.trim().length >= 6 ? data.password.trim() : "password123";

  // 1. Create user in auth.users (this triggers public.users insert)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    password: initialPassword,
    user_metadata: {
      name: data.name,
      role: "TEACHER",
    },
  });

  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  // 2. Insert into public.teachers
  const { error: teacherError } = await supabase.from("teachers").insert({
    user_id: userId,
    phone: data.phone ?? null,
  });

  if (teacherError) {
    // Rollback auth user creation if inserting into teachers fails
    await adminClient.auth.admin.deleteUser(userId);
    return { error: teacherError.message };
  }

  // 3. Update public.users to add avatar_url if provided
  if (data.avatar_url) {
    await supabase.from("users").update({ avatar_url: data.avatar_url }).eq("id", userId);
  }

  return { success: true };
}

export async function updateTeacher(id: string, userId: string, data: UserUpdateFormValues) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Update auth.users (email and metadata)
  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: { name: data.name },
  });

  if (authError) return { error: authError.message };

  // Update public.users table
  const { error: userError } = await supabase
    .from("users")
    .update({ name: data.name, email: data.email, avatar_url: data.avatar_url ?? null })
    .eq("id", userId);

  if (userError) return { error: userError.message };

  // Update teachers table
  const { error: teacherError } = await supabase
    .from("teachers")
    .update({ phone: data.phone ?? null })
    .eq("id", id);

  if (teacherError) return { error: teacherError.message };

  return { success: true };
}

export async function deleteTeacher(id: string, userId: string) {
  const adminClient = createAdminClient();

  // Deleting from auth.users will cascade to public.users and public.teachers
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  return { success: true };
}

// ----------------------------------------------------------------------
// PARENTS
// ----------------------------------------------------------------------

export async function createParent(data: UserFormValues) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const initialPassword = data.password && data.password.trim().length >= 6 ? data.password.trim() : "password123";

  // 1. Create user in auth.users
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    password: initialPassword,
    user_metadata: {
      name: data.name,
      role: "PARENT",
    },
  });

  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  // 2. Insert into public.parents
  const { error: parentError } = await supabase.from("parents").insert({
    user_id: userId,
    phone: data.phone ?? null,
  });

  if (parentError) {
    // Rollback
    await adminClient.auth.admin.deleteUser(userId);
    return { error: parentError.message };
  }

  // 3. Update public.users to add avatar_url if provided
  if (data.avatar_url) {
    await supabase.from("users").update({ avatar_url: data.avatar_url }).eq("id", userId);
  }

  return { success: true };
}

export async function updateParent(id: string, userId: string, data: UserUpdateFormValues) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Update auth.users (email and metadata)
  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: { name: data.name },
  });

  if (authError) return { error: authError.message };

  const { error: userError } = await supabase
    .from("users")
    .update({ name: data.name, email: data.email, avatar_url: data.avatar_url ?? null })
    .eq("id", userId);

  if (userError) return { error: userError.message };

  const { error: parentError } = await supabase
    .from("parents")
    .update({ phone: data.phone ?? null })
    .eq("id", id);

  if (parentError) return { error: parentError.message };

  return { success: true };
}

export async function deleteParent(id: string, userId: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { success: true };
}

// ----------------------------------------------------------------------
// CLASSES
// ----------------------------------------------------------------------

export async function createClass(data: ClassFormValues) {
  const supabase = await createClient();

  const { error } = await supabase.from("classes").insert({
    name: data.name,
    teacher_id: data.teacher_id || null,
    assistant_teacher_id: data.assistant_teacher_id || null,
    academic_year_id: data.academic_year_id || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateClass(id: string, data: ClassFormValues) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("classes")
    .update({
      name: data.name,
      teacher_id: data.teacher_id || null,
      assistant_teacher_id: data.assistant_teacher_id || null,
      academic_year_id: data.academic_year_id || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// ----------------------------------------------------------------------
// STUDENTS
// ----------------------------------------------------------------------

export async function createStudent(data: StudentFormValues) {
  const supabase = await createClient();

  // Insert student (keep parent_id for backward compat with parent_id_1)
  const { data: inserted, error } = await supabase.from("students").insert({
    name: data.name,
    class_id: data.class_id || null,
    parent_id: data.parent_id_1 || null,
    entry_academic_year_id: data.entry_academic_year_id || null,
    birth_date: data.birth_date || null,
    photo: data.photo || null,
  }).select("id").single();

  if (error) return { error: error.message };
  if (!inserted) return { error: "Gagal membuat data siswa" };

  // Insert into student_parents junction table
  const parentEntries: { student_id: string; parent_id: string; is_primary: boolean }[] = [];
  
  if (data.parent_id_1) {
    parentEntries.push({ student_id: inserted.id, parent_id: data.parent_id_1, is_primary: true });
  }
  if (data.parent_id_2 && data.parent_id_2 !== data.parent_id_1) {
    parentEntries.push({ student_id: inserted.id, parent_id: data.parent_id_2, is_primary: false });
  }

  if (parentEntries.length > 0) {
    const { error: spError } = await supabase.from("student_parents").insert(parentEntries);
    if (spError) {
      // Non-fatal: student is created, just log
      console.error("Error inserting student_parents:", spError.message);
    }
  }

  return { success: true };
}


export async function updateStudent(id: string, data: StudentFormValues) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update({
      name: data.name,
      class_id: data.class_id || null,
      parent_id: data.parent_id_1 || null,
      entry_academic_year_id: data.entry_academic_year_id || null,
      birth_date: data.birth_date || null,
      photo: data.photo || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Sync student_parents junction table
  // Delete all existing entries for this student, then re-insert
  await supabase.from("student_parents").delete().eq("student_id", id);

  const parentEntries: { student_id: string; parent_id: string; is_primary: boolean }[] = [];
  
  if (data.parent_id_1) {
    parentEntries.push({ student_id: id, parent_id: data.parent_id_1, is_primary: true });
  }
  if (data.parent_id_2 && data.parent_id_2 !== data.parent_id_1) {
    parentEntries.push({ student_id: id, parent_id: data.parent_id_2, is_primary: false });
  }

  if (parentEntries.length > 0) {
    const { error: spError } = await supabase.from("student_parents").insert(parentEntries);
    if (spError) {
      console.error("Error syncing student_parents:", spError.message);
    }
  }

  return { success: true };
}


export async function deleteStudent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// ----------------------------------------------------------------------
// ACADEMIC YEARS
// ----------------------------------------------------------------------

export async function createAcademicYear(name: string, is_active: boolean = false) {
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years").insert({ name, is_active });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateAcademicYear(id: string, name: string, is_active: boolean = false) {
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years").update({ name, is_active }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAcademicYear(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// ----------------------------------------------------------------------
// USER PASSWORD MANAGEMENT (Admin)
// ----------------------------------------------------------------------

export async function resetUserPassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.trim().length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword.trim(),
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ----------------------------------------------------------------------
// FILE UPLOADS
// ----------------------------------------------------------------------

import { uploadProfilePhoto, deleteProfilePhoto } from "@/utils/supabase/storage";

export async function uploadAvatar(formData: FormData, path: string) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided", url: null };
  return await uploadProfilePhoto(file, path);
}

export async function deleteAvatar(path: string) {
  return await deleteProfilePhoto(path);
}

