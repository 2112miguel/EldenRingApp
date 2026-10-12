import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: Boolean(request.cookies.get("elden_admin_token")?.value) });
}
