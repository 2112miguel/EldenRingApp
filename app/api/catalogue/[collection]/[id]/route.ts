import { NextRequest, NextResponse } from "next/server";
import {
  normalizeEntry,
  type CatalogueEntry,
} from "../../../../lib/elden-ring";

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
      `${baseUrl}/api/${collection}/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      return NextResponse.json(result, { status: response.status });
    const record = (result.data ?? result) as CatalogueEntry;
    if (!record?.id || !record?.name)
      return NextResponse.json(
        { success: false, error: "Registro inválido." },
        { status: 502 },
      );
    return NextResponse.json({ success: true, data: normalizeEntry(record) });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No fue posible consultar el registro relacionado.",
      },
      { status: 502 },
    );
  }
}
