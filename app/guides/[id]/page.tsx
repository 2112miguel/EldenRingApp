"use client";

import { ArrowLeft, BookOpen, Check, ChevronRight, ExternalLink, Lightbulb, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { imageSource, type CatalogueEntry, type Guide, type GuideSupplementSubsection, type RecordReference } from "../../lib/elden-ring";

const typeIcon = { warning: ShieldAlert, tip: Lightbulb, mechanic: BookOpen, lore: BookOpen, "npc-note": BookOpen, checklist: Check, "external-link": ExternalLink };
const typeLabel = { tip: "Consejo", warning: "Advertencia", mechanic: "Mecánica", lore: "Historia", "npc-note": "Nota de NPC", checklist: "Lista de verificación", "external-link": "Enlace externo" };

function GuideReferences({ references }: { references?: RecordReference[] }) {
  const [selected, setSelected] = useState<RecordReference | null>(null);
  const [entry, setEntry] = useState<CatalogueEntry | null>(null);
  const [loading, setLoading] = useState(false);

  async function openReference(reference: RecordReference) {
    if (selected?.collection === reference.collection && selected.id === reference.id) {
      setSelected(null);
      return;
    }
    setSelected(reference);
    setEntry(null);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/catalogue/${encodeURIComponent(reference.collection)}/${encodeURIComponent(reference.id ?? "")}`,
      );
      const result = await response.json();
      if (response.ok && result.data) setEntry(result.data as CatalogueEntry);
    } finally {
      setLoading(false);
    }
  }

  if (!references?.length) return null;
  return <div className="mt-5 grid gap-3 sm:grid-cols-2">{references.map((reference) => <button type="button" key={`${reference.collection}-${reference.id}`} onClick={() => void openReference(reference)} aria-expanded={selected?.collection === reference.collection && selected.id === reference.id} className="flex items-center gap-3 border border-[color:var(--line)] bg-black/10 p-3 text-left transition hover:border-[#cfb66f] hover:bg-[#5e4722]/20"><img src={imageSource(reference.image)} alt="" className="size-14 border border-[color:var(--line)] object-cover" /><div><p className="text-xs tracking-[.13em] text-[#b7a476]">{reference.collection} · Ver ficha</p><p className="mt-1 text-sm text-[#ead9ad]">{reference.name ?? "Registro relacionado"}</p></div></button>)}{selected && <div className="border border-[#b79648] bg-[#0c1819] p-4 sm:col-span-2"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-4"><img src={imageSource(entry?.image ?? selected.image)} alt="" className="size-24 shrink-0 border border-[color:var(--line)] object-cover" /><div><p className="text-xs tracking-[.13em] text-[#b7a476]">{selected.collection}</p><h4 className="mt-1 text-lg text-[#ead9ad]">{entry?.name ?? selected.name ?? "Registro relacionado"}</h4>{loading ? <p className="mt-2 text-sm text-[#b7a476]">Cargando ficha…</p> : <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#c8baa0]">{entry?.description || "Sin descripción disponible."}</p>}</div></div><button type="button" onClick={() => setSelected(null)} className="text-[#d8bf77] hover:text-[#f0cf7b]" aria-label="Cerrar ficha"><X className="size-5" /></button></div></div>}</div>;
}

const statLabels: Record<string, string> = {
  level: "Nivel", vigor: "Vigor", mind: "Mente", endurance: "Resistencia",
  strength: "Fuerza", dexterity: "Destreza", intelligence: "Inteligencia", faith: "Fe", arcane: "Arcano",
};

function DetailedGuideReferences({ references }: { references?: RecordReference[] }) {
  const [selected, setSelected] = useState<RecordReference | null>(null);
  const [entry, setEntry] = useState<CatalogueEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openCompendiumInNewTab = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href*="referenceCollection="]',
      );
      if (!link) return;
      event.preventDefault();
      window.open(link.href, "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", openCompendiumInNewTab);
    return () => document.removeEventListener("click", openCompendiumInNewTab);
  }, []);

  async function open(reference: RecordReference) {
    if (selected?.collection === reference.collection && selected.id === reference.id) {
      setSelected(null);
      return;
    }
    setSelected(reference);
    setEntry(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/catalogue/${encodeURIComponent(reference.collection)}/${encodeURIComponent(reference.id ?? "")}`);
      const result = await response.json();
      if (response.ok && result.data) setEntry(result.data as CatalogueEntry);
    } finally {
      setLoading(false);
    }
  }

  if (!references?.length) return null;
  const facts = entry ? [
    ["Tipo", entry.type ?? entry.category], ["Efecto", entry.effect ?? entry.effects], ["Habilidad", entry.skill], ["Peso", entry.weight], ["FP", entry.fpCost], ["Región", entry.region], ["Ubicación", typeof entry.location === "string" ? entry.location : undefined],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "") : [];
  const stats = entry?.stats && typeof entry.stats === "object" ? Object.entries(entry.stats).filter(([, value]) => value !== undefined && value !== null) : [];

  return <div className="mt-5 grid gap-3 sm:grid-cols-2">{references.map((reference) => <button type="button" key={`${reference.collection}-${reference.id}`} onClick={() => void open(reference)} className="group flex items-center gap-3 border border-[color:var(--line)] bg-black/10 p-3 text-left transition hover:border-[#cfb66f] hover:bg-[#5e4722]/20"><img src={imageSource(reference.image)} alt="" className="size-14 border border-[color:var(--line)] object-cover" /><span className="min-w-0 flex-1"><span className="block text-xs tracking-[.13em] text-[#b7a476]">{reference.collection} · Ficha rápida</span><span className="mt-1 block truncate text-sm text-[#ead9ad]">{reference.name ?? "Registro relacionado"}</span></span><ChevronRight className="size-4 shrink-0 text-[#b7a476] transition group-hover:translate-x-1 group-hover:text-[#e8cf87]" /></button>)}{selected && <div className="border border-[#b79648] bg-[#0c1819] p-4 sm:col-span-2"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-4"><img src={imageSource(entry?.image ?? selected.image)} alt="" className="size-24 shrink-0 border border-[color:var(--line)] object-cover" /><div className="min-w-0"><p className="text-xs tracking-[.13em] text-[#b7a476]">{selected.collection}</p><h4 className="mt-1 text-lg text-[#ead9ad]">{entry?.name ?? selected.name ?? "Registro relacionado"}</h4>{loading ? <p className="mt-2 text-sm text-[#b7a476]">Cargando ficha…</p> : <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#c8baa0]">{entry?.description || "Sin descripción disponible."}</p>}</div></div><button type="button" onClick={() => setSelected(null)} className="rounded p-1 text-[#d8bf77] transition hover:bg-white/10 hover:text-[#f0cf7b]" aria-label="Cerrar ficha"><X className="size-5" /></button></div>{!loading && entry && <><div className="mt-4 grid gap-2 border-t border-[color:var(--line)] pt-4 sm:grid-cols-2">{facts.map(([label, value]) => <p key={label} className="text-sm text-[#c8baa0]"><span className="text-[#b7a476]">{label}: </span>{String(value)}</p>)}</div>{stats.length > 0 && <div className="mt-4"><p className="text-xs tracking-[.14em] text-[#b7a476]">ATRIBUTOS INICIALES</p><div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{stats.map(([stat, value]) => <div key={stat} className="border border-[color:var(--line)] bg-black/20 p-2 text-center"><p className="text-[10px] text-[#b7a476]">{statLabels[stat] ?? stat}</p><p className="mt-1 text-sm text-[#ead9ad]">{String(value)}</p></div>)}</div></div>}{entry.requiredAttributes && entry.requiredAttributes.length > 0 && <p className="mt-4 text-sm text-[#c8baa0]"><span className="text-[#b7a476]">Requiere: </span>{entry.requiredAttributes.map((attribute) => `${attribute.name}${attribute.amount !== undefined ? ` ${attribute.amount}` : ""}`).join(" · ")}</p>}<a href={`/?referenceCollection=${encodeURIComponent(selected.collection)}&referenceId=${encodeURIComponent(selected.id ?? "")}`} className="mt-5 inline-flex items-center gap-2 border border-[#b79648] px-3 py-2 text-sm text-[#e8cf87] transition hover:bg-[#5e4722]/30"><BookOpen className="size-4" /> Abrir ficha completa en el Compendio <ExternalLink className="size-3.5" /></a></>}</div>}</div>;
}

function SupplementSubsections({
  subsections,
  depth = 0,
}: {
  subsections?: GuideSupplementSubsection[];
  depth?: number;
}) {
  if (!subsections?.length) return null;
  return <>{subsections.sort((a, b) => a.order - b.order).map((subsection) => <div key={subsection.order} className={depth === 0 ? "mt-5 border-l-2 border-[#7f6b35] pl-4" : "mt-4 border-l border-[#6b5a31] pl-4"}><h4 className="text-base text-[#e7d4a3]">{subsection.title}</h4><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{subsection.content}</p>{subsection.image && <img src={subsection.image} alt="" className="mt-4 max-h-80 w-full bg-black/20 object-contain" />}<DetailedGuideReferences references={subsection.references} /><SupplementSubsections subsections={subsection.subsections} depth={depth + 1} /></div>)}</>;
}

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { id } = await params;
      const response = await fetch(
        `/api/guides/detail/${encodeURIComponent(id)}?t=${Date.now()}`,
        { cache: "no-store" },
      );
      const result = await response.json();
      if (!alive) return;
      if (!response.ok || !result.success) throw new Error(result.error ?? "No fue posible cargar la guía.");
      setGuide(result.data ?? result);
    })().catch((reason) => alive && setError(reason instanceof Error ? reason.message : "No fue posible cargar la guía.")).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [params]);

  const cover = guide?.media?.find((media) => media.type === "image")?.url;
  if (loading) return <main className="min-h-screen bg-[#071011] p-8 text-[#b7a476]">Cargando guía…</main>;
  if (error || !guide) return <main className="min-h-screen bg-[#071011] p-8 text-[#e8ddc5]"><a href="/guides" className="inline-flex items-center gap-2 text-[#d8bf77]"><ArrowLeft className="size-4" /> Volver a guías</a><p className="mt-8 border border-red-300/40 p-4 text-red-200">{error || "Guía no encontrada."}</p></main>;

  return <main className="min-h-screen bg-[#071011] pb-16 text-[#e8ddc5]">
    <header className="relative isolate overflow-hidden border-b border-[color:var(--line)] px-5 py-14 md:px-8 md:py-20">
      {cover ? <img src={cover} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" /> : <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25" autoPlay muted loop playsInline><source src="/video/elden-ring-leaves.webm" type="video/webm" /></video>}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,13,14,.97),rgba(4,13,14,.7),rgba(4,13,14,.95))]" />
      <div className="mx-auto max-w-4xl"><a href="/guides" className="inline-flex items-center gap-2 text-sm text-[#d8bf77]"><ArrowLeft className="size-4" /> Todas las guías</a><p className="mt-8 text-xs tracking-[.18em] text-[#c8a955]">GUÍA DEL COMPENDIO</p><h1 className="mt-3 text-4xl text-[#f1dfaf] md:text-5xl">{guide.title}</h1>{guide.summary && <p className="mt-5 max-w-2xl whitespace-pre-line leading-relaxed text-[#d5c6a7]">{guide.summary}</p>}</div>
    </header>
    <article className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <div className="grid gap-10">{guide.sections?.sort((a, b) => a.order - b.order).map((section) => <section key={section.order} className="border-l-2 border-[#b79648] pl-5"><h2 className="text-2xl text-[#ecd9aa]">{section.title}</h2>{section.content && <p className="mt-3 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{section.content}</p>}<DetailedGuideReferences references={section.references} />{section.subsections?.sort((a, b) => a.order - b.order).map((subsection) => <div key={subsection.order} className="mt-6 border border-[color:var(--line)] bg-[#0b1718] p-5"><h3 className="text-lg text-[#e7d4a3]">{subsection.title}</h3><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{subsection.content}</p><DetailedGuideReferences references={subsection.references} /></div>)}</section>)}</div>
      {!!guide.supplements?.length && <section className="mt-12 grid gap-4"><h2 className="text-2xl text-[#ecd9aa]">Complementos</h2>{guide.supplements.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((supplement) => { const Icon = typeIcon[supplement.type]; return <div key={supplement.id} className="border border-[color:var(--line)] bg-[#0b1718] p-5"><p className="flex items-center gap-2 text-xs tracking-[.15em] text-[#d8bf77]"><Icon className="size-4" />{typeLabel[supplement.type]}</p><h3 className="mt-3 text-lg text-[#ead9ad]">{supplement.title}</h3><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{supplement.content}</p>{supplement.image && <img src={supplement.image} alt="" className="mt-4 max-h-96 w-full bg-black/20 object-contain" />}<DetailedGuideReferences references={supplement.references} /><SupplementSubsections subsections={supplement.subsections} /></div>; })}</section>}
    </article>
  </main>;
}
