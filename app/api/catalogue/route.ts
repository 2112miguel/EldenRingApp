import { NextRequest, NextResponse } from "next/server";
import { normalizeEntry, type CatalogueResponse } from "../../lib/elden-ring";

const endpoints: Record<string, string> = {
  Jefes: "bosses", Enemigos: "creatures", Armas: "weapons", Munición: "ammos",
  Armaduras: "armors", Escudos: "shields", Talismanes: "talismans", Objetos: "items",
  Invocaciones: "spirits", "Cenizas de guerra": "ashes", Hechicerías: "sorceries",
  Encantamientos: "incantations", Áreas: "locations",
};

const pageNumber = (value: string | null, fallback: number) => Math.max(0, Number.parseInt(value ?? "", 10) || fallback);

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") ?? "Jefes";
  const endpoint = endpoints[section];
  if (!endpoint) return NextResponse.json({ success: false, count: 0, total: 0, data: [] }, { status: 400 });

  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return NextResponse.json({ success: false, count: 0, total: 0, data: [], error: "Backend no configurado." }, { status: 500 });

  const page = pageNumber(request.nextUrl.searchParams.get("page"), 0);
  const limit = Math.min(100, Math.max(1, pageNumber(request.nextUrl.searchParams.get("limit"), 10)));
  const name = request.nextUrl.searchParams.get("name")?.trim();
  const upstream = new URL(`${baseUrl}/api/${endpoint}`);
  upstream.searchParams.set("page", String(page));
  upstream.searchParams.set("limit", String(limit));
  if (name) upstream.searchParams.set("name", name);

  try {
    const response = await fetch(upstream, { cache: "no-store" });
    if (!response.ok) throw new Error("Upstream service unavailable");
    const result = (await response.json()) as Partial<CatalogueResponse>;
    const data = Array.isArray(result.data) ? result.data.filter((entry) => Boolean(entry?.id && entry?.name)).map(normalizeEntry) : [];
    return NextResponse.json({ success: result.success === true, count: Number(result.count ?? data.length), total: Number(result.total ?? data.length), data });
  } catch {
    return NextResponse.json({ success: false, count: 0, total: 0, data: [], error: "No fue posible cargar esta sección." }, { status: 502 });
  }
}
