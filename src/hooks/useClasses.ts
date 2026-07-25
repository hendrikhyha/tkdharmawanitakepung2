"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface ClassData {
  id: string;
  name: string;
  teacher_id: string | null;
  academic_year_id: string | null;
  teachers: {
    users: {
      name: string;
    };
  } | null;
  academic_years: {
    name: string;
  } | null;
}

export function useClasses() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          teacher_id,
          academic_year_id,
          teachers (
            users (
              name
            )
          ),
          academic_years (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      
      return (data as unknown as ClassData[]) || [];
    },
  });
}

export interface AcademicYearData {
  id: string;
  name: string;
  is_active: boolean;
}

export function useAcademicYears() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["academic_years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .order("name", { ascending: false });

      if (error) throw new Error(error.message);
      
      return (data as AcademicYearData[]) || [];
    },
  });
}
