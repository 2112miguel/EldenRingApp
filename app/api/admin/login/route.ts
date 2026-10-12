import { NextRequest, NextResponse } from "next/server";

const cookieName = "elden_admin_token";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ success: false, error: "Ingresa correo y contraseña." }, { status: 400 });
  }

  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return NextResponse.json({ success: false, error: "Backend no configurado." }, { status: 500 });

  try {
    const upstream = await fetch(`${baseUrl}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({})) as { success?: boolean; accessToken?: string; expiresAt?: string };
    if (!upstream.ok || !result.success || !result.accessToken) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas." }, { status: 401 });
    }

    const expiresIn = result.expiresAt ? Math.max(60, Math.floor((new Date(result.expiresAt).getTime() - Date.now()) / 1000)) : 3600;
    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieName, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "No fue posible iniciar sesión." }, { status: 502 });
  }
}
