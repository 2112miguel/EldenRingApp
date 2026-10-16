import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  const upstreamUrl = new URL(`${baseUrl}/api/guides/admin`);
  for (const key of ["status", "page", "limit"])
    request.nextUrl.searchParams.get(key) &&
      upstreamUrl.searchParams.set(key, request.nextUrl.searchParams.get(key)!);
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
    const response = NextResponse.json(result, { status: upstream.status });
    if (upstream.status === 401)
      response.cookies.set("elden_admin_token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible cargar las guías." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  const guide = await request.json().catch(() => null);
  if (!guide || typeof guide !== "object" || Array.isArray(guide))
    return NextResponse.json(
      { success: false, error: "Guía inválida." },
      { status: 400 },
    );
  try {
    const upstream = await fetch(`${baseUrl}/api/guides`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(guide),
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible crear la guía." },
      { status: 502 },
    );
  }
}
