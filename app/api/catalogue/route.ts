import { NextRequest, NextResponse } from "next/server";
import type { CatalogueEntry } from "../../lib/elden-ring";

const endpoints: Record<string, string> = {
  "Jefes": "bosses", "Enemigos": "creatures", "Armas": "weapons", "Munición": "ammos",
  "Armaduras": "armors", "Escudos": "shields", "Talismanes": "talismans", "Objetos": "items",
  "Invocaciones": "spirits", "Cenizas de guerra": "ashes", "Hechicerías": "sorceries",
  "Encantamientos": "incantations", "Áreas": "locations",
};

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") ?? "Jefes";
  const endpoint = endpoints[section];
  if (!endpoint) return NextResponse.json({ data: [] }, { status: 400 });
  try {
    const response = await fetch(`https://eldenring.fanapis.com/api/${endpoint}?limit=100`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Upstream service unavailable");
    const result = (await response.json()) as { data?: CatalogueEntry[] };
    return NextResponse.json({ data: (result.data ?? []).filter((entry) => Boolean(entry.name && entry.image)) });
  } catch { return NextResponse.json({ data: [], error: "No fue posible cargar esta sección." }, { status: 502 }); }
}
