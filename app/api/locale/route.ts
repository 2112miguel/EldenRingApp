import { NextRequest, NextResponse } from "next/server";
import { localeCookieName, resolveLocale } from "../../lib/locale";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const locale = resolveLocale(typeof body.locale === "string" ? body.locale : null);
  const response = NextResponse.json({ success: true, locale });
  response.cookies.set(localeCookieName, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
