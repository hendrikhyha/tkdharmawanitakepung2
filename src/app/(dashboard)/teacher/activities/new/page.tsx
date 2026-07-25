"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActivityForm from "@/components/dashboard/ActivityForm";
import { createActivity } from "@/app/actions/activities";

export default function NewActivityPage() {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsMutating(true);
    const res = await createActivity(formData);
    setIsMutating(false);

    if (res.success) {
      router.push("/teacher/activities");
    }

    return res;
  };

  return (
    <ActivityForm
      onSubmit={handleSubmit}
      isMutating={isMutating}
      titleText="Buat Jurnal Kegiatan Baru"
    />
  );
}
