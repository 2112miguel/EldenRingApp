"use client";

import { ArrowLeft, BookOpen, Check, ExternalLink, Lightbulb, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { imageSource, type Guide, type RecordReference } from "../../lib/elden-ring";

const typeIcon = { warning: ShieldAlert, tip: Lightbulb, mechanic: BookOpen, lore: BookOpen, "npc-note": BookOpen, checklist: Check, "external-link": ExternalLink };
const typeLabel = { tip: "Consejo", warning: "Advertencia", mechanic: "Mecánica", lore: "Historia", "npc-note": "Nota de NPC", checklist: "Lista de verificación", "external-link": "Enlace externo" };

function GuideReferences({ references }: { references?: RecordReference[] }) {
  if (!references?.length) return null;
  return <div className="mt-5 grid gap-3 sm:grid-cols-2">{references.map((reference) => <a key={`${reference.collection}-${reference.id}`} href={`/?referenceCollection=${encodeURIComponent(reference.collection)}&referenceId=${encodeURIComponent(reference.id ?? "")}`} className="flex items-center gap-3 border border-[color:var(--line)] bg-black/10 p-3 no-underline transition hover:border-[#cfb66f] hover:bg-[#5e4722]/20"><img src={imageSource(reference.image)} alt="" className="size-14 border border-[color:var(--line)] object-cover" /><div><p className="text-xs tracking-[.13em] text-[#b7a476]">{reference.collection} · Ver en compendio</p><p className="mt-1 text-sm text-[#ead9ad]">{reference.name ?? "Registro relacionado"}</p></div></a>)}</div>;
}

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { id } = await params;
      const response = await fetch(`/api/guides/detail/${encodeURIComponent(id)}`);
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
      <div className="grid gap-10">{guide.sections?.sort((a, b) => a.order - b.order).map((section) => <section key={section.order} className="border-l-2 border-[#b79648] pl-5"><h2 className="text-2xl text-[#ecd9aa]">{section.title}</h2>{section.content && <p className="mt-3 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{section.content}</p>}<GuideReferences references={section.references} />{section.subsections?.sort((a, b) => a.order - b.order).map((subsection) => <div key={subsection.order} className="mt-6 border border-[color:var(--line)] bg-[#0b1718] p-5"><h3 className="text-lg text-[#e7d4a3]">{subsection.title}</h3><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{subsection.content}</p><GuideReferences references={subsection.references} /></div>)}</section>)}</div>
      {!!guide.supplements?.length && <section className="mt-12 grid gap-4"><h2 className="text-2xl text-[#ecd9aa]">Complementos</h2>{guide.supplements.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((supplement) => { const Icon = typeIcon[supplement.type]; return <div key={supplement.id} className="border border-[color:var(--line)] bg-[#0b1718] p-5"><p className="flex items-center gap-2 text-xs tracking-[.15em] text-[#d8bf77]"><Icon className="size-4" />{typeLabel[supplement.type]}</p><h3 className="mt-3 text-lg text-[#ead9ad]">{supplement.title}</h3><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{supplement.content}</p>{supplement.image && <img src={supplement.image} alt="" className="mt-4 max-h-96 w-full bg-black/20 object-contain" />}<GuideReferences references={supplement.references} />{supplement.subsections?.sort((a, b) => a.order - b.order).map((subsection) => <div key={subsection.order} className="mt-5 border-l-2 border-[#7f6b35] pl-4"><h4 className="text-base text-[#e7d4a3]">{subsection.title}</h4><p className="mt-2 whitespace-pre-line leading-relaxed text-[#cfc2a7]">{subsection.content}</p>{subsection.image && <img src={subsection.image} alt="" className="mt-4 max-h-80 w-full bg-black/20 object-contain" />}<GuideReferences references={subsection.references} /></div>)}</div>; })}</section>}
    </article>
  </main>;
}
