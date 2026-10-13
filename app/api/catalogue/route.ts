import { NextRequest, NextResponse } from "next/server";
import { normalizeEntry, type CatalogueResponse } from "../../lib/elden-ring";

const endpoints: Record<string, string> = {
  Jefes: "bosses",
  Enemigos: "creatures",
  Armas: "weapons",
  Munición: "ammos",
  Armaduras: "armors",
  Escudos: "shields",
  Talismanes: "talismans",
  Objetos: "items",
  Invocaciones: "spirits",
  "Cenizas de guerra": "ashes",
  Hechicerías: "sorceries",
  Encantamientos: "incantations",
  Áreas: "locations",
  Clases: "classes",
  NPCs: "npcs",
};

const pageNumber = (value: string | null, fallback: number) =>
  Math.max(0, Number.parseInt(value ?? "", 10) || fallback);

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") ?? "Jefes";
  const endpoint = endpoints[section];
  if (!endpoint && section !== "Todos")
    return NextResponse.json(
      { success: false, count: 0, total: 0, data: [] },
      { status: 400 },
    );

  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl)
    return NextResponse.json(
      {
        success: false,
        count: 0,
        total: 0,
        data: [],
        error: "Backend no configurado.",
      },
      { status: 500 },
    );

  const page = pageNumber(request.nextUrl.searchParams.get("page"), 0);
  const limit = Math.min(
    100,
    Math.max(1, pageNumber(request.nextUrl.searchParams.get("limit"), 10)),
  );
  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (section === "Todos") {
    if (!name)
      return NextResponse.json({ success: true, count: 0, total: 0, data: [] });
    try {
      const results = await Promise.all(
        Object.entries(endpoints).map(
          async ([sourceSection, sourceEndpoint]) => {
            const searchUrl = new URL(`${baseUrl}/api/${sourceEndpoint}`);
            searchUrl.searchParams.set("page", "0");
            searchUrl.searchParams.set("limit", "100");
            searchUrl.searchParams.set("name", name);
            const response = await fetch(searchUrl, { cache: "no-store" });
            if (!response.ok) return [];
            const result =
              (await response.json()) as Partial<CatalogueResponse>;
            return Array.isArray(result.data)
              ? result.data
                  .filter((entry) => Boolean(entry?.id && entry?.name))
                  .map((entry) => ({ ...normalizeEntry(entry), sourceSection }))
              : [];
          },
        ),
      );
      const data = results.flat();
      const start = page * limit;
      return NextResponse.json({
        success: true,
        count: Math.min(limit, Math.max(0, data.length - start)),
        total: data.length,
        data: data.slice(start, start + limit),
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          count: 0,
          total: 0,
          data: [],
          error: "No fue posible buscar en el compendio.",
        },
        { status: 502 },
      );
    }
  }
  const upstream = new URL(`${baseUrl}/api/${endpoint}`);
  upstream.searchParams.set("page", String(page));
  upstream.searchParams.set("limit", String(limit));
  if (name) upstream.searchParams.set("name", name);

  try {
    const response = await fetch(upstream, { cache: "no-store" });
    if (!response.ok) throw new Error("Upstream service unavailable");
    const result = (await response.json()) as Partial<CatalogueResponse>;
    const data = Array.isArray(result.data)
      ? result.data
          .filter((entry) => Boolean(entry?.id && entry?.name))
          .map(normalizeEntry)
      : [];
    return NextResponse.json({
      success: result.success === true,
      count: Number(result.count ?? data.length),
      total: Number(result.total ?? data.length),
      data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        count: 0,
        total: 0,
        data: [],
        error: "No fue posible cargar esta sección.",
      },
      { status: 502 },
    );
  }
}
