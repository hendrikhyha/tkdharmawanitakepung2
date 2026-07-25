"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface StudentData {
  id: string;
  name: string;
  class_id: string | null;
  parent_id: string | null;
  birth_date: string | null;
  classes: {
    name: string;
  } | null;
  parents: {
    users: {
      name: string;
    };
  } | null;
}

export function useStudents() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          class_id,
          parent_id,
          birth_date,
          classes (
            name
          ),
          parents (
            users (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      
      return (data as unknown as StudentData[]) || [];
    },
  });
}
