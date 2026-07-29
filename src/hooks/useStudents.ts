"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface StudentData {
  id: string;
  name: string;
  class_id: string | null;
  parent_id: string | null;
  birth_date: string | null;
  photo: string | null;
  entry_academic_year_id: string | null;
  classes: {
    name: string;
  } | null;
  parents: {
    users: {
      name: string;
    };
  } | null;
  entry_academic_year: {
    name: string;
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
          entry_academic_year_id,
          birth_date,
          photo,
          classes (
            name
          ),
          parents (
            users (
              name
            )
          ),
          entry_academic_year:academic_years!students_entry_academic_year_id_fkey (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      
      return (data as unknown as StudentData[]) || [];
    },
  });
}
