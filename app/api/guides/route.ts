import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  const upstreamUrl = new URL(`${baseUrl}/api/guides`);
  upstreamUrl.searchParams.set("status", "published");
  for (const key of ["page", "limit"])
    request.nextUrl.searchParams.get(key) &&
      upstreamUrl.searchParams.set(key, request.nextUrl.searchParams.get(key)!);
  try {
    const upstream = await fetch(upstreamUrl, { cache: "no-store" });
    const result = await upstream.json().catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible cargar las guías." },
      { status: 502 },
    );
  }
}
