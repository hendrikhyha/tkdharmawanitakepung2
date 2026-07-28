"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActivityForm from "@/components/dashboard/ActivityForm";
import { updateActivity } from "@/app/actions/activities";

interface EditActivityFormWrapperProps {
  activity: {
    id: string;
    theme: string;
    sub_theme: string | null;
    description: string | null;
    activity_date: string;
    activity_time: string | null;
    status: "DRAFT" | "PUBLISHED";
    activity_photos: Array<{ id: string; image_url: string }>;
  };
}

export default function EditActivityFormWrapper({ activity }: EditActivityFormWrapperProps) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsMutating(true);
    const res = await updateActivity(activity.id, formData);
    setIsMutating(false);

    if (res.success) {
      router.push("/teacher/activities");
    }

    return res;
  };

  return (
    <ActivityForm
      initialData={activity}
      onSubmit={handleSubmit}
      isMutating={isMutating}
      titleText="Edit Jurnal Kegiatan"
    />
  );
}
