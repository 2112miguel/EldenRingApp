export type Attribute = { name: string; amount?: number; scaling?: string };

export type CatalogueEntry = {
  id: string;
  name: string;
  image: string | null;
  description: string;
  location?: string;
  drops?: string[];
  healthPoints?: string;
  category?: string;
  type?: string;
  weight?: number;
  effect?: string;
  effects?: string;
  affinity?: string;
  skill?: string;
  fpCost?: string | number;
  hpCost?: string | number;
  cost?: string | number;
  slots?: string | number;
  requires?: Attribute[];
  requiredAttributes?: Attribute[];
  scalesWith?: Attribute[];
  passive?: string;
  attackPower?: Attribute[];
  attack?: Attribute[];
  defence?: Attribute[];
  dmgNegation?: Attribute[];
  resistance?: Attribute[];
};

export type CatalogueResponse = { success: boolean; count: number; total: number; data: CatalogueEntry[] };
export const IMAGE_PLACEHOLDER = "/images/entry-placeholder.svg";

export function imageSource(image?: string | null) {
  return image?.trim() ? image : IMAGE_PLACEHOLDER;
}

const attributeFields = ["requires", "requiredAttributes", "scalesWith", "attackPower", "attack", "defence", "dmgNegation", "resistance"] as const;

function attributes(value: unknown): Attribute[] | undefined {
  const values = Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];
  const valid = values.filter((value): value is Attribute => Boolean(value && typeof value === "object" && "name" in value));
  return valid.length ? valid : undefined;
}

export function normalizeEntry(entry: CatalogueEntry): CatalogueEntry {
  const normalized = { ...entry } as CatalogueEntry;
  for (const field of attributeFields) normalized[field] = attributes(entry[field]);
  return normalized;
}

export async function getBosses(): Promise<CatalogueResponse> {
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return { success: false, count: 0, total: 0, data: [] };
  try {
    const response = await fetch(`${baseUrl}/api/bosses?page=0&limit=10`, { next: { revalidate: 3600 } });
    if (!response.ok) return { success: false, count: 0, total: 0, data: [] };
    const result = (await response.json()) as Partial<CatalogueResponse>;
    const data = Array.isArray(result.data) ? result.data.filter((entry): entry is CatalogueEntry => Boolean(entry?.id && entry?.name)).map(normalizeEntry) : [];
    return { success: result.success === true, count: Number(result.count ?? data.length), total: Number(result.total ?? data.length), data };
  } catch { return { success: false, count: 0, total: 0, data: [] }; }
}
