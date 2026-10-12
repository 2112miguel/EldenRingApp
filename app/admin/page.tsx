import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import AdminDashboard from "./admin-dashboard";

export const instant = false;

export default async function AdminPage() {
  await connection();
  const token = (await cookies()).get("elden_admin_token")?.value;
  if (!token) redirect("/admin/login");
  return <AdminDashboard />;
}
