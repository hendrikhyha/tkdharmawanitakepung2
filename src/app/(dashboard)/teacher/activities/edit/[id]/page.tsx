import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import EditActivityFormWrapper from "./EditActivityFormWrapper";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditActivityPage({ params }: EditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user to ensure authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get teacher ID
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!teacher) redirect("/teacher");

  // Fetch activity
  const { data: activity, error } = await supabase
    .from("activities")
    .select(`
      id,
      theme,
      sub_theme,
      description,
      activity_date,
      activity_time,
      status,
      activity_photos (
        id,
        image_url
      )
    `)
    .eq("id", id)
    .eq("teacher_id", teacher.id)
    .single();

  if (error || !activity) {
    redirect("/teacher/activities");
  }

  // Cast activity photos to appropriate format
  const formattedActivity = {
    ...activity,
    activity_photos: (activity.activity_photos as Array<{ id: string; image_url: string }>) || [],
  };

  return (
    <EditActivityFormWrapper activity={formattedActivity} />
  );
}
