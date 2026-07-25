import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import AdminShell from "@/components/dashboard/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return <AdminShell user={user}>{children}</AdminShell>;
}
