import { NextRequest, NextResponse } from "next/server";

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

const isSimpleValue = (value: unknown) =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );

  const payload = await request.json().catch(() => null);
  const section = payload?.section;
  const id = payload?.id;
  const changes = payload?.changes;
  const endpoint = typeof section === "string" ? endpoints[section] : undefined;
  const invalidChanges =
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes) ||
    Object.keys(changes).length === 0 ||
    Object.entries(changes).some(
      ([key, value]) => key === "id" || key === "_id" || !isSimpleValue(value),
    );

  if (!endpoint || typeof id !== "string" || !id || invalidChanges) {
    return NextResponse.json(
      { success: false, error: "Solicitud de edición inválida." },
      { status: 400 },
    );
  }

  const baseUrl = process.env.ELDEN_RING_API_BASE_URL;
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );

  const upstream = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/${endpoint}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
      cache: "no-store",
    },
  );
  const result = await upstream
    .json()
    .catch(() => ({
      success: false,
      error: "Respuesta inválida del backend.",
    }));
  return NextResponse.json(result, { status: upstream.status });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("elden_admin_token")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, error: "Sesión de administrador requerida." },
      { status: 401 },
    );
  const payload = await request.json().catch(() => null);
  const section = payload?.section;
  const values = payload?.values;
  const endpoint = typeof section === "string" ? endpoints[section] : undefined;
  const invalidValues =
    !values ||
    typeof values !== "object" ||
    Array.isArray(values) ||
    !Object.keys(values).length ||
    Object.entries(values).some(
      ([key, value]) => key === "id" || key === "_id" || !isSimpleValue(value),
    );
  if (!endpoint || invalidValues)
    return NextResponse.json(
      { success: false, error: "Registro inválido." },
      { status: 400 },
    );
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL;
  if (!baseUrl)
    return NextResponse.json(
      { success: false, error: "Backend no configurado." },
      { status: 500 },
    );
  try {
    const upstream = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        cache: "no-store",
      },
    );
    const result = await upstream
      .json()
      .catch(() => ({
        success: false,
        error: "Respuesta inválida del backend.",
      }));
    return NextResponse.json(result, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "No fue posible crear el registro." },
      { status: 502 },
    );
  }
}
