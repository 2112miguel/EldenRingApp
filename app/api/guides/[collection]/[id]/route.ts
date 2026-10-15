import { NextRequest, NextResponse } from "next/server";

const collections = new Set([
  "bosses",
  "creatures",
  "weapons",
  "ammos",
  "armors",
  "shields",
  "talismans",
  "items",
  "spirits",
  "ashes",
  "sorceries",
  "incantations",
  "locations",
  "classes",
  "npcs",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  if (!collections.has(collection))
    return NextResponse.json(
      { success: false, error: "Colección no permitida." },
      { status: 400 },
    );
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  try {
    const response = await fetch(
      `${baseUrl}/api/guides/${collection}/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible cargar la guía." },
      { status: 502 },
    );
  }
}
