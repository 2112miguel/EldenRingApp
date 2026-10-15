import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );
  const { id } = await params;
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  try {
    const upstream = await fetch(
      `${baseUrl}/api/guides/admin/${encodeURIComponent(id)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    const result = await upstream.json().catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible cargar la guía." },
      { status: 502 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );
  const { id } = await params;
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
    const upstream = await fetch(
      `${baseUrl}/api/guides/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guide),
        cache: "no-store",
      },
    );
    const result = await upstream.json().catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible actualizar la guía." },
      { status: 502 },
    );
  }
}
