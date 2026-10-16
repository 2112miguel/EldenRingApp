export type Attribute = { name: string; amount?: number; scaling?: string };
export type RecordReference = {
  id?: string;
  collection: string;
  name: string | null;
  image?: string | null;
  kind?: "record" | "currency";
};
export type GuideSummary = { id: string; title: string; status: "published" };
export type GuideSupplementSubsection = {
  order: number;
  title: string;
  content: string;
  image?: string | null;
  references?: RecordReference[];
  subsections?: GuideSupplementSubsection[];
};
export type Guide = {
  id: string;
  title: string;
  summary?: string;
  sections: {
    order: number;
    title: string;
    content: string;
    references?: RecordReference[];
    subsections?: {
      order: number;
      title: string;
      content: string;
      references?: RecordReference[];
    }[];
  }[];
  supplements?: {
    id: string;
    order?: number;
    type:
      | "tip"
      | "warning"
      | "mechanic"
      | "lore"
      | "npc-note"
      | "checklist"
      | "external-link";
    title: string;
    content: string;
    image?: string | null;
    references?: RecordReference[];
    subsections?: GuideSupplementSubsection[];
  }[];
  media?: { type: string; url: string; alt?: string }[];
};
export type CatalogueEntry = {
  id: string;
  sourceSection?: string;
  guide?: GuideSummary | null;
  name: string;
  image: string | null;
  description: string;
  quote?: string | null;
  role?: string | null;
  location?: string | RecordReference | null;
  region?: string | null;
  drops?: (string | RecordReference)[];
  healthPoints?: string | number;
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
  isBaseGameStartingClass?: boolean;
  contentSource?: string | null;
  gameVersion?: string | null;
  stats?:
    | string
    | {
        level?: number;
        vigor?: number;
        mind?: number;
        endurance?: number;
        strength?: number;
        dexterity?: number;
        intelligence?: number;
        faith?: number;
        arcane?: number;
      };
  startingEquipment?: Record<
    string,
    (RecordReference & { quantity?: number })[]
  >;
  startingEquipmentSetName?: string | null;
  startingInventoryVerification?: {
    status?: string;
    verifiedCategories?: string[];
    unverifiedCategories?: string[];
  };
};

export type CatalogueResponse = {
  success: boolean;
  count: number;
  total: number;
  data: CatalogueEntry[];
};
export const IMAGE_PLACEHOLDER = "/images/entry-placeholder.svg";

export function imageSource(image?: string | null) {
  return image?.trim() ? image : IMAGE_PLACEHOLDER;
}

const attributeFields = [
  "requires",
  "requiredAttributes",
  "scalesWith",
  "attackPower",
  "attack",
  "defence",
  "dmgNegation",
  "resistance",
] as const;

function attributes(value: unknown): Attribute[] | undefined {
  const values = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : [];
  const valid = values.filter((value): value is Attribute =>
    Boolean(value && typeof value === "object" && "name" in value),
  );
  return valid.length ? valid : undefined;
}

export function normalizeEntry(entry: CatalogueEntry): CatalogueEntry {
  const normalized = { ...entry } as CatalogueEntry;
  if (!normalized.description?.trim())
    normalized.description =
      (typeof entry.quote === "string" && entry.quote.trim()) ||
      (typeof entry.role === "string" && entry.role.trim()) ||
      "";
  if (!normalized.category && typeof entry.role === "string")
    normalized.category = entry.role;
  for (const field of attributeFields)
    normalized[field] = attributes(entry[field]);
  return normalized;
}

export async function getBosses(): Promise<CatalogueResponse> {
  const baseUrl = process.env.ELDEN_RING_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return { success: false, count: 0, total: 0, data: [] };
  try {
    const response = await fetch(`${baseUrl}/api/bosses?page=0&limit=10`, {
      cache: "no-store",
    });
    if (!response.ok) return { success: false, count: 0, total: 0, data: [] };
    const result = (await response.json()) as Partial<CatalogueResponse>;
    const data = Array.isArray(result.data)
      ? result.data
          .filter((entry): entry is CatalogueEntry =>
            Boolean(entry?.id && entry?.name),
          )
          .map(normalizeEntry)
      : [];
    return {
      success: result.success === true,
      count: Number(result.count ?? data.length),
      total: Number(result.total ?? data.length),
      data,
    };
  } catch {
    return { success: false, count: 0, total: 0, data: [] };
  }
}
