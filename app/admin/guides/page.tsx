import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import GuideEditor from "./guide-editor";

export const instant = false;

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await connection();
  if (!(await cookies()).get("elden_admin_token")?.value)
    redirect("/admin/login");
  const { id } = await searchParams;
  return <GuideEditor guideId={id} />;
}
