import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import DraftList from "./draft-list";

export const instant = false;

export default async function DraftsPage() {
  await connection();
  if (!(await cookies()).get("elden_admin_token")?.value)
    redirect("/admin/login");
  return <DraftList />;
}
