"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderActivities, publishActivity, deleteActivity } from "@/app/actions/activities";

export interface ActivityPhoto {
  id: string;
  image_url: string;
}

export interface ActivityData {
  id: string;
  title: string;
  description: string | null;
  activity_date: string;
  activity_time: string | null;
  status: "DRAFT" | "PUBLISHED";
  sort_order: number;
  activity_photos: ActivityPhoto[];
}

export function useActivities(date: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["activities", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Get teacher ID
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!teacher) throw new Error("Teacher profile not found");

      // Get activities for this teacher on this date
      const { data, error } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          description,
          activity_date,
          activity_time,
          status,
          sort_order,
          activity_photos (
            id,
            image_url
          )
        `)
        .eq("teacher_id", teacher.id)
        .eq("activity_date", date)
        .order("sort_order", { ascending: true });

      if (error) throw new Error(error.message);

      return (data as unknown as ActivityData[]) || [];
    },
  });
}

export function useReorderActivities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderedIds }: { orderedIds: string[]; date: string }) => {
      const res = await reorderActivities(orderedIds);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] }); // for dashboard stats reload
    },
  });
}

export function usePublishActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "DRAFT" | "PUBLISHED"; date: string }) => {
      const res = await publishActivity(id, status);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities", variables.date] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; date: string }) => {
      const res = await deleteActivity(id);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities", variables.date] });
    },
  });
}
