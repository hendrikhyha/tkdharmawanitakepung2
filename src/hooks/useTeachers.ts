"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface TeacherData {
  id: string; // from teachers table
  user_id: string;
  phone: string | null;
  users: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function useTeachers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          id,
          user_id,
          phone,
          users (
            name,
            email,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      
      // Ensure the users array is treated as a single object (since it's a 1-to-1 relationship, supabase returns it as single or array depending on the foreign key setup. Since users.id is PK and teachers.user_id is unique, it's 1-to-1).
      // Supabase JS types might show it as an array if not defined as 1-1 strictly in PostgREST, but usually it's an object if queried correctly.
      
      return (data as unknown as TeacherData[]) || [];
    },
  });
}
