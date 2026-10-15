import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  try {
    const upstream = await fetch(
      `${baseUrl}/api/guides/${encodeURIComponent(id)}`,
      { cache: "no-store" },
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
