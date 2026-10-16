"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  imageSource,
  type CatalogueEntry,
  type CatalogueResponse,
} from "../../lib/elden-ring";

const collections = [
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
];
const supplementTypes = [
  "tip",
  "warning",
  "mechanic",
  "lore",
  "npc-note",
  "checklist",
  "external-link",
] as const;
const supplementTypeLabels: Record<(typeof supplementTypes)[number], string> = {
  tip: "Consejo",
  warning: "Advertencia",
  mechanic: "Mecánica",
  lore: "Historia",
  "npc-note": "Nota de NPC",
  checklist: "Lista de verificación",
  "external-link": "Enlace externo",
};
const sectionByCollection: Record<string, string> = {
  bosses: "Jefes",
  creatures: "Enemigos",
  weapons: "Armas",
  ammos: "Munición",
  armors: "Armaduras",
  shields: "Escudos",
  talismans: "Talismanes",
  items: "Objetos",
  spirits: "Invocaciones",
  ashes: "Cenizas de guerra",
  sorceries: "Hechicerías",
  incantations: "Encantamientos",
  locations: "Áreas",
  classes: "Clases",
  npcs: "NPCs",
};
type PickedRecord = {
  collection: string;
  id: string;
  name: string;
  image?: string | null;
  description?: string;
};
type GuideSubsection = {
  title: string;
  content: string;
  referenceCollection: string;
  references: PickedRecord[];
  subsections?: GuideSubsection[];
};
type GuideSection = {
  title: string;
  content: string;
  referencesEnabled: boolean;
  referenceCollection: string;
  references: PickedRecord[];
  subsections: GuideSubsection[];
};
type Supplement = {
  id: string;
  type: (typeof supplementTypes)[number];
  title: string;
  content: string;
  image: string;
  referenceCollection: string;
  references: PickedRecord[];
  subsections: GuideSubsection[];
};

function SubsubsectionEditor({
  item,
  onChange,
  onRemove,
}: {
  item: GuideSubsection;
  onChange: (next: GuideSubsection) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 border-l-2 border-[#7f6b35] bg-black/10 p-3">
      <div className="flex justify-between text-xs text-[#b7a476]">
        <span>SUBSUBSECCIÓN</span>
        <button type="button" onClick={onRemove} className="text-red-300">Quitar</button>
      </div>
      <input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} placeholder="Título de la subsubsección" className="border border-[color:var(--line)] bg-transparent px-3 py-2" />
      <textarea value={item.content} onChange={(event) => onChange({ ...item, content: event.target.value })} placeholder="Contenido de la subsubsección" rows={3} className="border border-[color:var(--line)] bg-transparent px-3 py-2" />
      <label className="grid gap-2 text-sm">Colección de referencias<select value={item.referenceCollection} onChange={(event) => onChange({ ...item, referenceCollection: event.target.value })} className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2">{collections.map((collection) => <option key={collection}>{collection}</option>)}</select></label>
      <RecordPicker collection={item.referenceCollection} label="Agregar referencia a esta subsubsección" onPick={(record) => {
        if (item.references.some((reference) => reference.collection === record.collection && reference.id === record.id)) return;
        onChange({ ...item, references: [...item.references, record] });
      }} />
      {!!item.references.length && <div className="grid gap-2 sm:grid-cols-2">{item.references.map((reference) => <button type="button" key={`${reference.collection}-${reference.id}`} onClick={() => onChange({ ...item, references: item.references.filter((candidate) => candidate.collection !== reference.collection || candidate.id !== reference.id) })} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border border-[color:var(--line)] p-2 text-left hover:border-red-300"><img src={imageSource(reference.image)} alt="" className="size-12 border border-[color:var(--line)] object-cover" /><span className="truncate text-sm text-[#ead9ad]">{recordLabel(reference)}</span><span>×</span></button>)}</div>}
    </div>
  );
}

function RecordPicker({
  collection,
  label,
  onPick,
  requiresQuery = true,
  showFilter = true,
}: {
  collection: string;
  label?: string;
  onPick: (record: PickedRecord) => void;
  requiresQuery?: boolean;
  showFilter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<CatalogueEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPage(0);
    setQuery("");
    setIsOpen(false);
  }, [collection]);

  useEffect(() => {
    let alive = true;
    if (!isOpen && query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return () => {
        alive = false;
      };
    }
    setLoading(true);
    fetch(
      `/api/catalogue?section=${encodeURIComponent(sectionByCollection[collection])}&page=${page}&limit=3&name=${encodeURIComponent(query.trim())}`,
    )
      .then((response) => response.json())
      .then((result: CatalogueResponse) => {
        if (!alive) return;
        setResults(result.data ?? []);
        setTotal(result.total ?? 0);
      })
      .catch(() => {
        if (!alive) return;
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [collection, page, query, requiresQuery, isOpen]);

  const totalPages = Math.max(1, Math.ceil(total / 3));

  return (
    <div className="grid gap-2">
      {showFilter && (
        <label className="text-sm">
          {label && <span className="block">{label}</span>}
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
              if (event.target.value.trim().length >= 2) setIsOpen(true);
            }}
            placeholder="Filtrar registros..."
            className={`${label ? "mt-2 " : ""}w-full border border-[color:var(--line)] bg-transparent px-3 py-2`}
          />
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="w-fit border border-[color:var(--line)] px-3 py-1.5 text-xs text-[#d5c18b] transition hover:border-[#d5c18b]"
      >
        {isOpen ? "Ocultar registros" : "Mostrar registros"}
      </button>
      {isOpen && <div className="grid gap-2">
        {loading && (
          <p className="text-xs text-[#b7a476]">Cargando registros...</p>
        )}
        {!loading && results.length === 0 && (
          <p className="border border-dashed border-[color:var(--line)] p-3 text-xs text-[#b7a476]">
            {requiresQuery && query.trim().length < 2
              ? "Escribe al menos 2 caracteres para buscar."
              : "No hay registros para esta búsqueda."}
          </p>
        )}
        {results.map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => {
              onPick({
                collection,
                id: record.id,
                name: record.name,
                image: record.image,
                description: record.description,
              });
            }}
            className="grid grid-cols-[3.5rem_1fr] gap-3 border border-[color:var(--line)] p-2 text-left transition hover:border-[#d5c18b] hover:bg-white/5"
          >
            <img
              src={imageSource(record.image)}
              alt=""
              className="size-14 border border-[color:var(--line)] object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm text-[#ead9ad]">
                {record.name}
              </span>
              <span className="mt-1 line-clamp-2 block text-xs text-[#b7a476]">
                {record.description || "Sin descripción disponible."}
              </span>
            </span>
          </button>
        ))}
      </div>}
      {isOpen && total > 0 && (
        <div className="flex items-center justify-between text-xs text-[#b7a476]">
          <span>
            Página {page + 1} de {totalPages} · {total} registros
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="border border-[color:var(--line)] px-2 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => current + 1)}
              className="border border-[color:var(--line)] px-2 py-1 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedRecordCard({ record }: { record: PickedRecord }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-4 border border-[#b79b50] bg-[#101b1b] p-3">
      <img
        src={imageSource(record.image)}
        alt=""
        className="size-20 border border-[color:var(--line)] object-cover"
      />
      <div className="min-w-0">
        <p className="text-xs tracking-[.14em] text-[#b7a476]">SELECCIONADO</p>
        <p className="mt-1 text-lg text-[#ead9ad]">{recordLabel(record)}</p>
        <p className="mt-1 line-clamp-3 text-sm text-[#c8baa0]">
          {record.description || "Sin descripción disponible."}
        </p>
      </div>
    </div>
  );
}

const asPickedRecord = (reference: Record<string, unknown>): PickedRecord => ({
  collection: String(reference.collection ?? "items"),
  id: String(reference.id ?? ""),
  name: String(reference.name ?? reference.id ?? "Registro"),
  image: typeof reference.image === "string" ? reference.image : null,
  description:
    typeof reference.description === "string" ? reference.description : "",
});

async function hydratePickedRecord(reference: Record<string, unknown>) {
  const fallback = asPickedRecord(reference);
  if (!fallback.collection || !fallback.id) return fallback;
  try {
    const response = await fetch(
      `/api/catalogue/${encodeURIComponent(fallback.collection)}/${encodeURIComponent(fallback.id)}`,
    );
    const result = await response.json();
    const record = result.data as CatalogueEntry | undefined;
    if (!response.ok || !record?.name) return fallback;
    return {
      ...fallback,
      name: record.name,
      image: record.image,
      description: record.description,
    };
  } catch {
    return fallback;
  }
}

async function hydratePickedRecords(references: PickedRecord[]) {
  return Promise.all(
    references.map((reference) => hydratePickedRecord(reference)),
  );
}

function readGuideSubsection(value: Record<string, unknown>): GuideSubsection {
  const references = Array.isArray(value.references)
    ? value.references.map(asPickedRecord)
    : [];
  return {
    title: String(value.title ?? ""),
    content: String(value.content ?? ""),
    referenceCollection: String(
      (value.references as Record<string, unknown>[] | undefined)?.[0]
        ?.collection ?? "items",
    ),
    references,
    subsections: Array.isArray(value.subsections)
      ? value.subsections.map((subsection) =>
          readGuideSubsection(subsection as Record<string, unknown>),
        )
      : [],
  };
}

async function hydrateGuideSubsection(
  subsection: GuideSubsection,
): Promise<GuideSubsection> {
  return {
    ...subsection,
    references: await hydratePickedRecords(subsection.references),
    subsections: await Promise.all(
      (subsection.subsections ?? []).map(hydrateGuideSubsection),
    ),
  };
}

type SerializedGuideSubsection = {
  order: number;
  title: string;
  content: string;
  image: null;
  references: { collection: string; id: string }[];
  subsections: SerializedGuideSubsection[];
};

function serializeGuideSubsection(
  subsection: GuideSubsection,
  order: number,
): SerializedGuideSubsection {
  return {
    order,
    title: subsection.title.trim(),
    content: subsection.content.trim(),
    image: null,
    references: subsection.references.map(({ collection, id }) => ({ collection, id })),
    subsections: (subsection.subsections ?? [])
      .filter((child) => child.title.trim() && child.content.trim())
      .map((child, childIndex) =>
        serializeGuideSubsection(child, childIndex + 1),
      ),
  };
}

function subsectionTreeSignature(
  subsections: Array<{ title?: unknown; content?: unknown; subsections?: unknown }>,
  prefix = "",
): string[] {
  return subsections.flatMap((subsection, index) => {
    const path = `${prefix}${index}:${String(subsection.title ?? "").trim()}|${String(subsection.content ?? "").trim()}`;
    const children = Array.isArray(subsection.subsections)
      ? subsectionTreeSignature(
          subsection.subsections as Array<{
            title?: unknown;
            content?: unknown;
            subsections?: unknown;
          }>,
          `${path}/`,
        )
      : [];
    return [path, ...children];
  });
}

function recordLabel(record: PickedRecord) {
  return record.name && record.name !== record.id
    ? record.name
    : "Registro relacionado";
}

function moveReference<T>(
  references: T[],
  index: number,
  direction: -1 | 1,
) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= references.length) return references;
  const next = [...references];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export default function GuideEditor({ guideId }: { guideId?: string }) {
  const router = useRouter();
  const [collection, setCollection] = useState("bosses");
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [subject, setSubject] = useState<PickedRecord | null>(null);
  const [subjectEnabled, setSubjectEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<GuideSection[]>([
    {
      title: "Preparación",
      content: "",
      referencesEnabled: false,
      referenceCollection: "items",
      references: [],
      subsections: [],
    },
  ]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(Boolean(guideId));

  useEffect(() => {
    if (!guideId) return;
    let alive = true;
    fetch(
      `/api/admin/guides/${encodeURIComponent(guideId)}?t=${Date.now()}`,
      { cache: "no-store" },
    )
      .then((response) =>
        response.json().then((result) => ({ response, result })),
      )
      .then(({ response, result }) => {
        if (!alive) return;
        const guide = result.data ?? result;
        if (!response.ok || !result.success || !guide?.id)
          throw new Error(result.error ?? "No se pudo cargar el borrador.");
        const subjectValue = guide.subject as
          Record<string, unknown> | undefined;
        setEditingGuideId(String(guide.id));
        const hasSubject = Boolean(
          subjectValue?.collection && subjectValue?.id,
        );
        setSubjectEnabled(hasSubject);
        setCollection(String(subjectValue?.collection ?? "bosses"));
        setSubject(hasSubject ? asPickedRecord(subjectValue!) : null);
        if (hasSubject)
          void hydratePickedRecord(subjectValue!).then(
            (record) => alive && setSubject(record),
          );
        setTitle(String(guide.title ?? ""));
        setSummary(String(guide.summary ?? ""));
        setCoverUrl(
          Array.isArray(guide.media) && typeof guide.media[0]?.url === "string"
            ? guide.media[0].url
            : "",
        );
        setStatus(guide.status === "published" ? "published" : "draft");
        const loadedSections: GuideSection[] = Array.isArray(guide.sections)
            ? guide.sections.map((section: Record<string, unknown>) => ({
                title: String(section.title ?? ""),
                content: String(section.content ?? ""),
                referencesEnabled:
                  Array.isArray(section.references) &&
                  section.references.length > 0,
                referenceCollection: String(
                  (
                    section.references as Record<string, unknown>[] | undefined
                  )?.[0]?.collection ?? "items",
                ),
                references: Array.isArray(section.references)
                  ? section.references.map(asPickedRecord)
                  : [],
                subsections: Array.isArray(section.subsections)
                  ? section.subsections.map(
                      (subsection: Record<string, unknown>) => ({
                        title: String(subsection.title ?? ""),
                        content: String(subsection.content ?? ""),
                        referenceCollection: String(
                          (
                            subsection.references as
                              Record<string, unknown>[] | undefined
                          )?.[0]?.collection ?? "items",
                        ),
                        references: Array.isArray(subsection.references)
                          ? subsection.references.map(asPickedRecord)
                          : [],
                      }),
                    )
                  : [],
              }))
            : [];
        setSections(loadedSections);
        void Promise.all(
          loadedSections.map(async (section) => ({
            ...section,
            references: await hydratePickedRecords(section.references),
            subsections: await Promise.all(
              section.subsections.map(async (subsection) => ({
                ...subsection,
                references: await hydratePickedRecords(subsection.references),
              })),
            ),
          })),
        ).then((hydratedSections) => alive && setSections(hydratedSections));
        const loadedSupplements: Supplement[] = Array.isArray(guide.supplements)
            ? guide.supplements.map((supplement: Record<string, unknown>) => ({
                id: String(supplement.id ?? `supplement-${Date.now()}`),
                type: supplementTypes.includes(
                  supplement.type as (typeof supplementTypes)[number],
                )
                  ? (supplement.type as Supplement["type"])
                  : "tip",
                title: String(supplement.title ?? ""),
                content: String(supplement.content ?? ""),
                image: String(supplement.image ?? ""),
                referenceCollection: String(
                  (
                    supplement.references as
                      Record<string, unknown>[] | undefined
                  )?.[0]?.collection ?? "items",
                ),
                references: Array.isArray(supplement.references)
                  ? supplement.references.map(asPickedRecord)
                  : [],
                subsections: Array.isArray(supplement.subsections)
                  ? supplement.subsections.map((subsection) =>
                      readGuideSubsection(
                        subsection as Record<string, unknown>,
                      ),
                    )
                  : [],
              }))
            : [];
        setSupplements(loadedSupplements);
        void Promise.all(
          loadedSupplements.map(async (supplement) => ({
            ...supplement,
            references: await hydratePickedRecords(supplement.references),
            subsections: await Promise.all(
              supplement.subsections.map(hydrateGuideSubsection),
            ),
          })),
        ).then((hydratedSupplements) => alive && setSupplements(hydratedSupplements));
      })
      .catch((error) => alive && setMessage(error.message))
      .finally(() => alive && setLoadingGuide(false));
    return () => {
      alive = false;
    };
  }, [guideId]);

  async function submit() {
    setSaving(true);
    setMessage("");
    try {
      if (!title.trim()) throw new Error("Escribe el título de la guía.");
      const payload = {
        subject:
          subjectEnabled && subject
            ? { collection: subject.collection, id: subject.id }
            : null,
        title: title.trim(),
        summary: summary.trim(),
        media: coverUrl.trim()
          ? [{ type: "image", url: coverUrl.trim(), alt: title.trim() }]
          : [],
        status,
        sections: sections
          .filter(
            (item) =>
              item.content.trim() ||
              (item.referencesEnabled && item.references.length > 0) ||
              item.subsections.length > 0,
          )
          .map((item, index) => ({
            order: index + 1,
            ...(item.title.trim() ? { title: item.title.trim() } : {}),
            content: item.content.trim(),
            references: item.referencesEnabled
              ? item.references.map(({ collection, id }) => ({
                  collection,
                  id,
                }))
              : [],
            subsections: item.subsections
              .filter(
                (subsection) =>
                  subsection.title.trim() && subsection.content.trim(),
              )
              .map((subsection, subsectionIndex) => ({
                order: subsectionIndex + 1,
                title: subsection.title.trim(),
                content: subsection.content.trim(),
                references: subsection.references.map(({ collection, id }) => ({
                  collection,
                  id,
                })),
              })),
          })),
        supplements: supplements
          .filter((item) => item.title.trim() && item.content.trim())
          .map((item, index) => ({
            id: item.id,
            order: index + 1,
            type: item.type,
            title: item.title.trim(),
            content: item.content.trim(),
            // The API calculates the effective image from the first reference.
            // Sending null lets the selected order determine that image.
            image: null,
            references: item.references.map(({ collection, id }) => ({
              collection,
              id,
            })),
            subsections: item.subsections
              .filter(
                (subsection) =>
                  subsection.title.trim() && subsection.content.trim(),
              )
              .map((subsection, subsectionIndex) =>
                serializeGuideSubsection(subsection, subsectionIndex + 1),
              ),
          })),
      };
      const response = await fetch(
        editingGuideId
          ? `/api/admin/guides/${encodeURIComponent(editingGuideId)}`
          : "/api/admin/guides",
        {
          method: editingGuideId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success)
        throw new Error(result.error ?? "No se pudo guardar la guía.");

      const returnedGuide = result.data ?? result;
      if (Array.isArray(returnedGuide?.supplements)) {
        const expected = payload.supplements.flatMap((supplement) =>
          subsectionTreeSignature(supplement.subsections),
        );
        const persisted = returnedGuide.supplements.flatMap(
          (supplement: { subsections?: unknown }) =>
            subsectionTreeSignature(
              Array.isArray(supplement.subsections)
                ? supplement.subsections
                : [],
            ),
        );
        if (expected.join("\n") !== persisted.join("\n")) {
          throw new Error(
            "El backend respondió correctamente, pero no conservó todas las subsecciones del complemento. La guía no se cerró para evitar ocultar el problema.",
          );
        }
      }
      const savedId = result.id ?? result.data?.id ?? editingGuideId;
      if (savedId) setEditingGuideId(String(savedId));
      setMessage(editingGuideId ? "Guía actualizada." : "Guía creada.");
      router.back();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar la guía.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#071011] p-5 text-[#e8ddc5] md:p-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line)] pb-5">
        <div>
          <p className="text-xs tracking-[.16em] text-[#b7a476]">
            ADMINISTRACIÓN PRIVADA
          </p>
          <h1 className="mt-1 text-3xl">
            {editingGuideId ? "Editar guía" : "Nueva guía"}
          </h1>
        </div>
        <a
          href="/admin"
          className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </a>
      </header>
      {loadingGuide ? (
        <p className="mx-auto max-w-4xl text-[#b7a476]">Cargando borrador…</p>
      ) : (
        <section className="mx-auto grid max-w-4xl gap-5 border border-[color:var(--line)] bg-[#0b1718] p-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Estado
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "draft" | "published")
              }
              className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="border border-[color:var(--line)] bg-transparent px-3 py-2"
            />
          </label>
          <div className="grid gap-2 text-sm md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-[#e5cf99]">
              <input
                type="checkbox"
                checked={subjectEnabled}
                onChange={(event) => {
                  setSubjectEnabled(event.target.checked);
                  if (!event.target.checked) setSubject(null);
                }}
                className="size-4 accent-[#d9bc7e]"
              />
              Vincular registro del compendio (opcional)
            </label>
            {subjectEnabled && (
              <>
                <label className="grid gap-2 text-sm">
                  Colección del registro
                  <select
                    value={collection}
                    onChange={(event) => {
                      setCollection(event.target.value);
                      setSubject(null);
                    }}
                    className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                  >
                    {collections.map((collectionOption) => (
                      <option key={collectionOption}>{collectionOption}</option>
                    ))}
                  </select>
                </label>
                <RecordPicker
                  collection={collection}
                  label="Buscar registro principal"
                  onPick={setSubject}
                  requiresQuery
                />
                {subject && <SelectedRecordCard record={subject} />}
              </>
            )}
          </div>
          <label className="grid gap-2 text-sm md:col-span-2">
            Resumen
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              className="border border-[color:var(--line)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Imagen de portada (URL opcional)
            <input
              value={coverUrl}
              onChange={(event) => setCoverUrl(event.target.value)}
              placeholder="https://.../portada.png"
              className="border border-[color:var(--line)] bg-transparent px-3 py-2"
            />
            {coverUrl.trim() && <img src={coverUrl} alt="Vista previa de portada" className="max-h-52 w-full border border-[color:var(--line)] object-cover" />}
          </label>
          <div className="grid gap-3 border-t border-[color:var(--line)] pt-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-[#e5cf99]">Secciones</h2>
              <button
                type="button"
                onClick={() =>
                  setSections((current) => [
                    ...current,
                    {
                      title: "",
                      content: "",
                      image: "",
                      referencesEnabled: false,
                      referenceCollection: "items",
                      references: [],
                      subsections: [],
                    },
                  ])
                }
                className="border border-[color:var(--line)] px-3 py-1 text-sm"
              >
                Añadir sección
              </button>
            </div>
            {sections.map((item, index) => (
              <details key={index} className="border border-[color:var(--line)]">
                <summary className="cursor-pointer px-4 py-3 text-xs text-[#b7a476] marker:text-[#d5c18b]">
                  SECCIÓN {index + 1}{item.title.trim() ? ` · ${item.title}` : ""}
                </summary>
                <div className="grid gap-3 border-t border-[color:var(--line)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b7a476]">
                    SECCIÓN {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="text-xs text-red-300"
                  >
                    Quitar
                  </button>
                </div>
                <input
                  value={item.title}
                  onChange={(event) =>
                    setSections((current) =>
                      current.map((section, itemIndex) =>
                        itemIndex === index
                          ? { ...section, title: event.target.value }
                          : section,
                      ),
                    )
                  }
                  placeholder="Título de sección (opcional)"
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                />
                <textarea
                  value={item.content}
                  onChange={(event) =>
                    setSections((current) =>
                      current.map((section, itemIndex) =>
                        itemIndex === index
                          ? { ...section, content: event.target.value }
                          : section,
                      ),
                    )
                  }
                  placeholder="Contenido de la sección"
                  rows={5}
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                />
                <div className="grid gap-3 border-t border-[color:var(--line)] pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#e5cf99]">Subsecciones</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSections((current) =>
                          current.map((section, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...section,
                                  subsections: [
                                    ...section.subsections,
                                    {
                                      title: "",
                                      content: "",
                                      referenceCollection: "items",
                                      references: [],
                                    },
                                  ],
                                }
                              : section,
                          ),
                        )
                      }
                      className="border border-[color:var(--line)] px-2 py-1 text-xs"
                    >
                      Añadir subsección
                    </button>
                  </div>
                  {item.subsections.map((subsection, subsectionIndex) => (
                    <details key={subsectionIndex} className="border border-[color:var(--line)]">
                      <summary className="cursor-pointer px-3 py-2 text-xs text-[#b7a476] marker:text-[#d5c18b]">
                        SUBSECCIÓN {subsectionIndex + 1}{subsection.title.trim() ? ` · ${subsection.title}` : ""}
                      </summary>
                      <div className="grid gap-2 border-t border-[color:var(--line)] p-3">
                      <div className="flex justify-between text-xs text-[#b7a476]">
                        <span>SUBSECCIÓN {subsectionIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSections((current) =>
                              current.map((section, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...section,
                                      subsections: section.subsections.filter(
                                        (_, candidateIndex) =>
                                          candidateIndex !== subsectionIndex,
                                      ),
                                    }
                                  : section,
                              ),
                            )
                          }
                          className="text-red-300"
                        >
                          Quitar
                        </button>
                      </div>
                      <input
                        value={subsection.title}
                        onChange={(event) =>
                          setSections((current) =>
                            current.map((section, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...section,
                                    subsections: section.subsections.map(
                                      (candidate, candidateIndex) =>
                                        candidateIndex === subsectionIndex
                                          ? {
                                              ...candidate,
                                              title: event.target.value,
                                            }
                                          : candidate,
                                    ),
                                  }
                                : section,
                            ),
                          )
                        }
                        placeholder="Título de subsección"
                        className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                      />
                      <textarea
                        value={subsection.content}
                        onChange={(event) =>
                          setSections((current) =>
                            current.map((section, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...section,
                                    subsections: section.subsections.map(
                                      (candidate, candidateIndex) =>
                                        candidateIndex === subsectionIndex
                                          ? {
                                              ...candidate,
                                              content: event.target.value,
                                            }
                                          : candidate,
                                    ),
                                  }
                                : section,
                            ),
                          )
                        }
                        placeholder="Contenido de la subsección"
                        rows={3}
                        className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                      />
                      <label className="grid gap-2 text-sm">
                        Colección de referencias
                        <select
                          value={subsection.referenceCollection}
                          onChange={(event) =>
                            setSections((current) =>
                              current.map((section, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...section,
                                      subsections: section.subsections.map(
                                        (candidate, candidateIndex) =>
                                          candidateIndex === subsectionIndex
                                            ? {
                                                ...candidate,
                                                referenceCollection:
                                                  event.target.value,
                                              }
                                            : candidate,
                                      ),
                                    }
                                  : section,
                              ),
                            )
                          }
                          className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                        >
                          {collections.map((collectionOption) => (
                            <option key={collectionOption}>
                              {collectionOption}
                            </option>
                          ))}
                        </select>
                      </label>
                      <RecordPicker
                        collection={subsection.referenceCollection}
                        label="Buscar referencia para esta subsección"
                        onPick={(record) =>
                          setSections((current) =>
                            current.map((section, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...section,
                                    subsections: section.subsections.map(
                                      (candidate, candidateIndex) => {
                                        if (candidateIndex !== subsectionIndex)
                                          return candidate;
                                        if (
                                          candidate.references.some(
                                            (reference) =>
                                              reference.collection ===
                                                record.collection &&
                                              reference.id === record.id,
                                          )
                                        )
                                          return candidate;
                                        return {
                                          ...candidate,
                                          references: [
                                            ...candidate.references,
                                            record,
                                          ],
                                        };
                                      },
                                    ),
                                  }
                                : section,
                            ),
                          )
                        }
                      />
                      {subsection.references.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {subsection.references.map((reference) => (
                            <button
                              type="button"
                              key={`${reference.collection}-${reference.id}`}
                              onClick={() =>
                                setSections((current) =>
                                  current.map((section, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...section,
                                          subsections: section.subsections.map(
                                            (candidate, candidateIndex) =>
                                              candidateIndex === subsectionIndex
                                                ? {
                                                    ...candidate,
                                                    references:
                                                      candidate.references.filter(
                                                        (candidateReference) =>
                                                          candidateReference.collection !==
                                                            reference.collection ||
                                                          candidateReference.id !==
                                                            reference.id,
                                                      ),
                                                  }
                                                : candidate,
                                          ),
                                        }
                                      : section,
                                  ),
                                )
                              }
                              className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border border-[color:var(--line)] p-2 text-left transition hover:border-[#d5c18b] hover:bg-white/5"
                            >
                              <img
                                src={imageSource(reference.image)}
                                alt=""
                                className="size-12 border border-[color:var(--line)] object-cover"
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-sm text-[#ead9ad]">
                                  {recordLabel(reference)}
                                </span>
                                <span className="mt-1 line-clamp-1 block text-xs text-[#b7a476]">
                                  {reference.description ||
                                    "Referencia de la subsección"}
                                </span>
                              </span>
                              <span className="text-sm text-[#d5c18b]">×</span>
                            </button>
                          ))}
                        </div>
                      )}
                      </div>
                    </details>
                  ))}
                </div>
                <label className="flex items-center gap-2 border-t border-[color:var(--line)] pt-3 text-sm text-[#e5cf99]">
                  <input
                    type="checkbox"
                    checked={item.referencesEnabled}
                    onChange={(event) =>
                      setSections((current) =>
                        current.map((section, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...section,
                                referencesEnabled: event.target.checked,
                              }
                            : section,
                        ),
                      )
                    }
                    className="size-4 accent-[#d9bc7e]"
                  />
                  Agregar referencias de colección
                </label>
                {item.referencesEnabled && (
                  <div className="grid gap-3 border-t border-[color:var(--line)] pt-3">
                    <label className="grid gap-2 text-sm">
                      Colección de referencias
                      <select
                        value={item.referenceCollection}
                        onChange={(event) =>
                          setSections((current) =>
                            current.map((section, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...section,
                                    referenceCollection: event.target.value,
                                  }
                                : section,
                            ),
                          )
                        }
                        className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                      >
                        {collections.map((collectionOption) => (
                          <option key={collectionOption}>
                            {collectionOption}
                          </option>
                        ))}
                      </select>
                    </label>
                    <RecordPicker
                      collection={item.referenceCollection}
                      label="Buscar referencia para esta sección"
                      onPick={(record) =>
                        setSections((current) =>
                          current.map((section, itemIndex) => {
                            if (itemIndex !== index) return section;
                            if (
                              section.references.some(
                                (reference) =>
                                  reference.collection === record.collection &&
                                  reference.id === record.id,
                              )
                            )
                              return section;
                            return {
                              ...section,
                              references: [...section.references, record],
                            };
                          }),
                        )
                      }
                    />
                    {item.references.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.references.map((reference) => (
                          <button
                            type="button"
                            key={`${reference.collection}-${reference.id}`}
                            onClick={() =>
                              setSections((current) =>
                                current.map((section, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...section,
                                        references: section.references.filter(
                                          (candidate) =>
                                            candidate.collection !==
                                              reference.collection ||
                                            candidate.id !== reference.id,
                                        ),
                                      }
                                    : section,
                                ),
                              )
                            }
                            className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border border-[color:var(--line)] p-2 text-left transition hover:border-[#d5c18b] hover:bg-white/5"
                          >
                            <img
                              src={imageSource(reference.image)}
                              alt=""
                              className="size-12 border border-[color:var(--line)] object-cover"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-[#ead9ad]">
                                {recordLabel(reference)}
                              </span>
                              <span className="mt-1 line-clamp-1 block text-xs text-[#b7a476]">
                                {reference.description ||
                                  "Referencia de la sección"}
                              </span>
                            </span>
                            <span className="text-sm text-[#d5c18b]">×</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                </div>
              </details>
            ))}
          </div>
          <div className="grid gap-3 border-t border-[color:var(--line)] pt-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg text-[#e5cf99]">Complementos</h2>
                <p className="text-xs text-[#b7a476]">
                  Notas especiales que existen solo dentro de esta guía.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSupplements((current) => [
                    ...current,
                    {
                      id: `supplement-${Date.now()}`,
                      type: "tip",
                      title: "",
                      content: "",
                      image: "",
                      referenceCollection: "items",
                      references: [],
                      subsections: [],
                    },
                  ])
                }
                className="border border-[color:var(--line)] px-3 py-1 text-sm"
              >
                Añadir complemento
              </button>
            </div>
            {supplements.map((item, index) => (
              <details key={item.id} className="border border-[color:var(--line)]">
                <summary className="cursor-pointer px-4 py-3 text-xs text-[#b7a476] marker:text-[#d5c18b]">
                  COMPLEMENTO {index + 1}{item.title.trim() ? ` · ${item.title}` : ""}
                </summary>
                <div className="grid gap-3 border-t border-[color:var(--line)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b7a476]">
                    COMPLEMENTO {index + 1}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setSupplements((current) =>
                          moveReference(current, index, -1),
                        )
                      }
                      className="text-[#d5c18b] disabled:opacity-30"
                    >
                      ↑ Subir
                    </button>
                    <button
                      type="button"
                      disabled={index === supplements.length - 1}
                      onClick={() =>
                        setSupplements((current) =>
                          moveReference(current, index, 1),
                        )
                      }
                      className="text-[#d5c18b] disabled:opacity-30"
                    >
                      ↓ Bajar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSupplements((current) =>
                          current.filter((candidate) => candidate.id !== item.id),
                        )
                      }
                      className="text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <select
                  value={item.type}
                  onChange={(event) =>
                    setSupplements((current) =>
                      current.map((supplement) =>
                        supplement.id === item.id
                          ? {
                              ...supplement,
                              type: event.target.value as Supplement["type"],
                            }
                          : supplement,
                      ),
                    )
                  }
                  className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                >
                  {supplementTypes.map((type) => (
                    <option key={type} value={type}>
                      {supplementTypeLabels[type]}
                    </option>
                  ))}
                </select>
                <input
                  value={item.title}
                  onChange={(event) =>
                    setSupplements((current) =>
                      current.map((supplement) =>
                        supplement.id === item.id
                          ? { ...supplement, title: event.target.value }
                          : supplement,
                      ),
                    )
                  }
                  placeholder="Título del complemento"
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                />
                <textarea
                  value={item.content}
                  onChange={(event) =>
                    setSupplements((current) =>
                      current.map((supplement) =>
                        supplement.id === item.id
                          ? { ...supplement, content: event.target.value }
                          : supplement,
                      ),
                    )
                  }
                  placeholder="Contenido del complemento"
                  rows={4}
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                />
                <div className="border-t border-[color:var(--line)] pt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-[#e5cf99]">Subsecciones</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setSupplements((current) =>
                          current.map((supplement) =>
                            supplement.id === item.id
                              ? {
                                  ...supplement,
                                  subsections: [
                                    ...supplement.subsections,
                                    {
                                      title: "",
                                      content: "",
                                      referenceCollection: "items",
                                      references: [],
                                    },
                                  ],
                                }
                              : supplement,
                          ),
                        )
                      }
                      className="border border-[color:var(--line)] px-2 py-1 text-xs"
                    >
                      Añadir subsección
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {item.subsections.map((subsection, subsectionIndex) => (
                      <details key={`${item.id}-subsection-${subsectionIndex}`} className="border border-[color:var(--line)] bg-black/10">
                        <summary className="cursor-pointer px-3 py-2 text-xs text-[#b7a476] marker:text-[#d5c18b]">
                          SUBSECCIÓN {subsectionIndex + 1}{subsection.title.trim() ? ` · ${subsection.title}` : ""}
                        </summary>
                        <div className="grid gap-3 border-t border-[color:var(--line)] p-3">
                        <div className="flex justify-between text-xs text-[#b7a476]">
                          <span>SUBSECCIÓN {subsectionIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSupplements((current) =>
                                current.map((supplement) =>
                                  supplement.id === item.id
                                    ? {
                                        ...supplement,
                                        subsections: supplement.subsections.filter(
                                          (_, candidateIndex) =>
                                            candidateIndex !== subsectionIndex,
                                        ),
                                      }
                                    : supplement,
                                ),
                              )
                            }
                            className="text-red-300"
                          >
                            Quitar
                          </button>
                        </div>
                        <input
                          value={subsection.title}
                          onChange={(event) =>
                            setSupplements((current) =>
                              current.map((supplement) =>
                                supplement.id === item.id
                                  ? {
                                      ...supplement,
                                      subsections: supplement.subsections.map(
                                        (candidate, candidateIndex) =>
                                          candidateIndex === subsectionIndex
                                            ? {
                                                ...candidate,
                                                title: event.target.value,
                                              }
                                            : candidate,
                                      ),
                                    }
                                  : supplement,
                              ),
                            )
                          }
                          placeholder="Título de la subsección"
                          className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                        />
                        <textarea
                          value={subsection.content}
                          onChange={(event) =>
                            setSupplements((current) =>
                              current.map((supplement) =>
                                supplement.id === item.id
                                  ? {
                                      ...supplement,
                                      subsections: supplement.subsections.map(
                                        (candidate, candidateIndex) =>
                                          candidateIndex === subsectionIndex
                                            ? {
                                                ...candidate,
                                                content: event.target.value,
                                              }
                                            : candidate,
                                      ),
                                    }
                                  : supplement,
                              ),
                            )
                          }
                          placeholder="Contenido de la subsección"
                          rows={3}
                          className="border border-[color:var(--line)] bg-transparent px-3 py-2"
                        />
                        <label className="grid gap-2 text-sm">
                          Colección de referencias
                          <select
                            value={subsection.referenceCollection}
                            onChange={(event) =>
                              setSupplements((current) => current.map((supplement) => supplement.id === item.id ? {
                                ...supplement,
                                subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, referenceCollection: event.target.value } : candidate),
                              } : supplement))
                            }
                            className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                          >
                            {collections.map((collectionOption) => <option key={collectionOption}>{collectionOption}</option>)}
                          </select>
                        </label>
                        <RecordPicker
                          collection={subsection.referenceCollection}
                          label="Agregar referencia a esta subsección"
                          onPick={(record) =>
                            setSupplements((current) => current.map((supplement) => supplement.id === item.id ? {
                              ...supplement,
                              subsections: supplement.subsections.map((candidate, candidateIndex) => {
                                if (candidateIndex !== subsectionIndex || candidate.references.some((reference) => reference.collection === record.collection && reference.id === record.id)) return candidate;
                                return { ...candidate, references: [...candidate.references, record] };
                              }),
                            } : supplement))
                          }
                        />
                        {!!subsection.references.length && <div className="grid gap-2 sm:grid-cols-2">{subsection.references.map((reference) => <button type="button" key={`${reference.collection}-${reference.id}`} onClick={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, references: candidate.references.filter((picked) => picked.collection !== reference.collection || picked.id !== reference.id) } : candidate) } : supplement))} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border border-[color:var(--line)] p-2 text-left hover:border-red-300"><img src={imageSource(reference.image)} alt="" className="size-12 border border-[color:var(--line)] object-cover" /><span className="truncate text-sm text-[#ead9ad]">{recordLabel(reference)}</span><span>×</span></button>)}</div>}
                        <div className="border-t border-[color:var(--line)] pt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-[#b7a476]">Subsubsecciones</p>
                            <button type="button" onClick={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: [...(candidate.subsections ?? []), { title: "", content: "", referenceCollection: "items", references: [], subsections: [] }] } : candidate) } : supplement))} className="border border-[color:var(--line)] px-2 py-1 text-xs">Añadir subsubsección</button>
                          </div>
                          <div className="mt-3 grid gap-3">
                            {(subsection.subsections ?? []).map((child, childIndex) => (
                              <SubsubsectionEditor
                                key={`editor-${item.id}-${subsectionIndex}-${childIndex}`}
                                item={child}
                                onChange={(next) => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: (candidate.subsections ?? []).map((grandchild, grandchildIndex) => grandchildIndex === childIndex ? next : grandchild) } : candidate) } : supplement))}
                                onRemove={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: (candidate.subsections ?? []).filter((_, grandchildIndex) => grandchildIndex !== childIndex) } : candidate) } : supplement))}
                              />
                            ))}
                          </div>
                          <div className="hidden">
                            {(subsection.subsections ?? []).map((child, childIndex) => <div key={`${item.id}-${subsectionIndex}-${childIndex}`} className="grid gap-2 border-l-2 border-[#7f6b35] bg-black/10 p-3"><div className="flex justify-between text-xs text-[#b7a476]"><span>SUBSUBSECCIÓN {childIndex + 1}</span><button type="button" onClick={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: (candidate.subsections ?? []).filter((_, index) => index !== childIndex) } : candidate) } : supplement))} className="text-red-300">Quitar</button></div><input value={child.title} onChange={(event) => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: (candidate.subsections ?? []).map((grandchild, index) => index === childIndex ? { ...grandchild, title: event.target.value } : grandchild) } : candidate) } : supplement))} placeholder="Título de la subsubsección" className="border border-[color:var(--line)] bg-transparent px-3 py-2" /><textarea value={child.content} onChange={(event) => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, subsections: supplement.subsections.map((candidate, candidateIndex) => candidateIndex === subsectionIndex ? { ...candidate, subsections: (candidate.subsections ?? []).map((grandchild, index) => index === childIndex ? { ...grandchild, content: event.target.value } : grandchild) } : candidate) } : supplement))} placeholder="Contenido de la subsubsección" rows={3} className="border border-[color:var(--line)] bg-transparent px-3 py-2" /></div>)}
                          </div>
                        </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
                <label className="grid gap-2 text-sm">
                  Colección de referencias
                  <select
                    value={item.referenceCollection}
                    onChange={(event) =>
                      setSupplements((current) =>
                        current.map((supplement) =>
                          supplement.id === item.id
                            ? {
                                ...supplement,
                                referenceCollection: event.target.value,
                              }
                            : supplement,
                        ),
                      )
                    }
                    className="border border-[color:var(--line)] bg-[#0b1718] px-3 py-2"
                  >
                    {collections.map((collectionOption) => (
                      <option key={collectionOption}>{collectionOption}</option>
                    ))}
                  </select>
                </label>
                <RecordPicker
                  collection={item.referenceCollection}
                  label="Agregar referencia al complemento"
                  onPick={(record) =>
                    setSupplements((current) =>
                      current.map((supplement) => {
                        if (supplement.id !== item.id) return supplement;
                        if (
                          supplement.references.some(
                            (reference) =>
                              reference.collection === record.collection &&
                              reference.id === record.id,
                          )
                        )
                          return supplement;
                        return {
                          ...supplement,
                          references: [...supplement.references, record],
                        };
                      }),
                    )
                  }
                />
                {item.references.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {item.references.map((reference) => (
                      <button
                        type="button"
                        key={`${reference.collection}-${reference.id}`}
                        onClick={() =>
                          setSupplements((current) =>
                            current.map((supplement) =>
                              supplement.id === item.id
                                ? {
                                    ...supplement,
                                    references: supplement.references.filter(
                                      (candidate) =>
                                        candidate.collection !==
                                          reference.collection ||
                                        candidate.id !== reference.id,
                                    ),
                                  }
                                : supplement,
                            ),
                          )
                        }
                        className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 border border-[#b79b50] bg-[#101b1b] p-3 text-left transition hover:border-red-300 hover:bg-white/5"
                      >
                        <img
                          src={imageSource(reference.image)}
                          alt=""
                          className="size-20 border border-[color:var(--line)] object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-lg text-[#ead9ad]">
                            {recordLabel(reference)}
                          </span>
                          <span className="mt-1 line-clamp-3 block text-sm text-[#c8baa0]">
                            {reference.description ||
                              "Referencia del complemento"}
                          </span>
                        </span>
                        <span className="text-sm text-[#d5c18b]">×</span>
                      </button>
                    ))}
                  </div>
                )}
                {item.references.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--line)] pt-3 text-xs text-[#b7a476]">
                    <span className="mr-1">Orden de imagen:</span>
                    {item.references.map((reference, referenceIndex) => (
                      <span key={`order-${reference.collection}-${reference.id}`} className="inline-flex items-center gap-1 border border-[color:var(--line)] px-2 py-1">
                        {referenceIndex + 1}. {recordLabel(reference)}
                        <button type="button" aria-label="Subir referencia" disabled={referenceIndex === 0} onClick={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, references: moveReference(supplement.references, referenceIndex, -1) } : supplement))} className="px-1 text-[#d5c18b] disabled:opacity-30">↑</button>
                        <button type="button" aria-label="Bajar referencia" disabled={referenceIndex === item.references.length - 1} onClick={() => setSupplements((current) => current.map((supplement) => supplement.id === item.id ? { ...supplement, references: moveReference(supplement.references, referenceIndex, 1) } : supplement))} className="px-1 text-[#d5c18b] disabled:opacity-30">↓</button>
                      </span>
                    ))}
                  </div>
                )}
                </div>
              </details>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 border border-[color:var(--gold)] px-4 py-3 text-sm text-[#efd79c] disabled:opacity-50 md:col-span-2"
          >
            <Save className="size-4" />
            {saving
              ? "Guardando…"
              : editingGuideId
                ? "Guardar cambios"
                : "Crear guía"}
          </button>
          {message && (
            <p className="text-sm text-[#d5c18b] md:col-span-2">{message}</p>
          )}
        </section>
      )}
    </main>
  );
}
