import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "ADMIN":
      redirect("/admin");
    case "TEACHER":
      redirect("/teacher");
    case "PARENT":
      redirect("/parent");
    default:
      redirect("/login");
  }
}
