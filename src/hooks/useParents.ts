"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface ParentData {
  id: string; // from parents table
  user_id: string;
  phone: string | null;
  users: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function useParents() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["parents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parents")
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
      
      return (data as unknown as ParentData[]) || [];
    },
  });
}
