export type Attribute = { name: string; amount?: number; scaling?: string };

export type CatalogueEntry = {
  id: string;
  name: string;
  image: string;
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

export async function getBosses(): Promise<CatalogueEntry[]> {
  try {
    const response = await fetch("https://eldenring.fanapis.com/api/bosses?limit=100", { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const result = (await response.json()) as { data?: CatalogueEntry[] };
    return (result.data ?? []).filter((entry) => Boolean(entry.name && entry.image));
  } catch { return []; }
}
