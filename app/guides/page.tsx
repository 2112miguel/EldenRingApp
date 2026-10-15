"use client";

import { ArrowLeft, ArrowRight, BookOpen, ImageIcon, MapPin, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

type GuideCard = {
  id: string;
  title: string;
  summary?: string;
  image?: string | null;
  coverImage?: string | null;
  media?: { type?: string; url?: string; alt?: string }[];
  subject?: { collection: string; id: string; name?: string } | null;
};

function relatedCover(guide: {
  coverImage?: string | null;
  media?: { type?: string; url?: string }[];
  sections?: {
    references?: { image?: string | null }[];
    subsections?: { references?: { image?: string | null }[] }[];
  }[];
}) {
  const direct = guide.coverImage ?? guide.media?.find((item) => item.type === "image" && item.url)?.url;
  if (direct) return direct;
  for (const section of guide.sections ?? []) {
    const reference = [
      ...(section.references ?? []),
      ...(section.subsections?.flatMap((subsection) => subsection.references ?? []) ?? []),
    ].find((item) => item.image);
    if (reference?.image) return reference.image;
  }
  return null;
}

function coverFor(guide: GuideCard) {
  return guide.coverImage ?? guide.image ?? guide.media?.find((media) => media.type === "image" && media.url)?.url ?? null;
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/guides?page=${page}&limit=${limit}`)
      .then((response) => response.json())
      .then((result) => {
        if (!alive) return;
        const cards = result.data ?? [];
        setGuides(cards);
        setTotal(Number(result.total ?? 0));
        void Promise.all(
          cards.map(async (guide: GuideCard) => {
            if (coverFor(guide)) return guide;
            try {
              const response = await fetch(`/api/guides/detail/${encodeURIComponent(guide.id)}`);
              const detail = await response.json();
              if (!response.ok || !detail.success) return guide;
              return { ...guide, coverImage: relatedCover(detail.data ?? detail) };
            } catch {
              return guide;
            }
          }),
        ).then((enrichedCards) => alive && setGuides(enrichedCards));
      })
      .catch(() => alive && setGuides([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [page]);

  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <main className="min-h-screen overflow-hidden bg-[#071011] text-[#e8ddc5]">
      <section className="relative isolate border-b border-[color:var(--line)] px-5 py-12 md:px-8 md:py-16">
        <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/video/elden-ring-leaves.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,13,14,.96),rgba(5,16,17,.76),rgba(4,13,14,.94))]" />
        <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-medium tracking-[.2em] text-[#cfb66f]"><ScrollText className="size-4" /> CRÓNICAS DE LAS TIERRAS INTERMEDIAS</p>
            <h1 className="mt-3 text-4xl text-[#f1dfaf] md:text-5xl">Guías</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#c8baa0] md:text-base">Estrategias, rutas y notas de viaje para avanzar con propósito entre la niebla.</p>
          </div>
          <a href="/" className="inline-flex items-center gap-2 border border-[color:var(--line)] bg-[#071011]/70 px-4 py-2.5 text-sm text-[#d5c18b] transition hover:border-[#cfb66f] hover:text-[#f1dfaf]"><ArrowLeft className="size-4" /> Volver al inicio</a>
        </header>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        {loading ? <p className="text-[#b7a476]">Cargando guías…</p> : null}
        {!loading && guides.length === 0 ? <p className="border border-dashed border-[color:var(--line)] p-5 text-[#b7a476]">Aún no hay guías publicadas.</p> : null}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const cover = coverFor(guide);
            return (
              <a href={`/guides/${encodeURIComponent(guide.id)}`} key={guide.id} className="group relative block min-h-80 overflow-hidden border border-[color:var(--line)] bg-[#0b1718] no-underline transition duration-300 hover:-translate-y-1 hover:border-[#cfb66f] hover:shadow-[0_18px_45px_rgba(0,0,0,.35)]">
                {cover ? (
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50" />
                ) : (
                  <>
                    <video className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-500 group-hover:scale-105 group-hover:opacity-40" autoPlay muted loop playsInline aria-hidden="true">
                      <source src="/video/elden-ring-leaves.webm" type="video/webm" />
                    </video>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(191,147,56,.22),transparent_34%),linear-gradient(145deg,#102324,#071112_70%)]" />
                  </>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,13,.08),rgba(4,12,13,.96)_88%)]" />
                <div className="relative flex min-h-80 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-2 border border-[#ae914d]/70 bg-[#071011]/75 px-2.5 py-1 text-[10px] font-medium tracking-[.16em] text-[#d8bf77]">{guide.subject ? <MapPin className="size-3.5" /> : <BookOpen className="size-3.5" />}{guide.subject?.collection ?? "GUÍA GENERAL"}</span>
                    {!cover && <ImageIcon className="size-6 text-[#b99745]/70" aria-hidden="true" />}
                  </div>
                  <div className="mt-auto">
                    <h2 className="max-w-md text-2xl leading-tight text-[#f1dfaf]">{guide.title}</h2>
                    {guide.subject?.name && <p className="mt-2 text-sm text-[#d9c18a]">{guide.subject.name}</p>}
                    {guide.summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#d1c4a8]">{guide.summary}</p>}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm text-[#d8bf77]">Leer guía <ArrowRight className="size-4" /></span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        {total > limit && <div className="mt-8 flex items-center justify-between text-sm text-[#b7a476]"><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="border border-[color:var(--line)] px-3 py-2 transition hover:border-[#cfb66f] disabled:opacity-40">Anterior</button><span>Página {page + 1} de {pages}</span><button type="button" disabled={page >= pages - 1} onClick={() => setPage((current) => current + 1)} className="border border-[color:var(--line)] px-3 py-2 transition hover:border-[#cfb66f] disabled:opacity-40">Siguiente</button></div>}
      </section>
    </main>
  );
}
