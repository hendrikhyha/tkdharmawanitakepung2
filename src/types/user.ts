export type UserRole = "ADMIN" | "TEACHER" | "PARENT";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
