"use client";

import { ArrowLeft, FilePenLine, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type GuideListItem = {
  id: string;
  title: string;
  status: "draft" | "published";
  subject: { collection: string; id: string; name?: string | null } | null;
  updatedAt?: string;
};

export default function DraftList() {
  const [guides, setGuides] = useState<GuideListItem[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/guides?status=${status}&page=${page}&limit=${limit}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : `No fue posible cargar las guías (${response.status}).`,
          );
        return result;
      })
      .then((result) => {
        if (!alive) return;
        setGuides(result.data ?? []);
        setTotal(Number(result.total ?? 0));
      })
      .catch((reason: unknown) => {
        if (!alive) return;
        setGuides([]);
        setTotal(0);
        setError(
          reason instanceof Error
            ? reason.message
            : "No fue posible cargar las guías.",
        );
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [page, status]);

  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <main className="min-h-screen bg-[#071011] p-5 text-[#e8ddc5] md:p-8">
      <header className="mx-auto mb-7 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line)] pb-5">
        <div><p className="text-xs tracking-[.16em] text-[#b7a476]">ADMINISTRACIÓN PRIVADA</p><h1 className="mt-1 text-3xl">Gestionar guías</h1></div>
        <a href="/admin" className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"><ArrowLeft className="size-4" /> Volver al panel</a>
      </header>
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-[color:var(--line)] bg-[#0b1718] p-3">
          <div className="flex gap-2">{(["draft", "published"] as const).map((item) => <button type="button" key={item} onClick={() => { setStatus(item); setPage(0); }} className={status === item ? "border border-[color:var(--gold)] bg-[#5e4722]/30 px-3 py-2 text-sm text-[#efd79c]" : "border border-[color:var(--line)] px-3 py-2 text-sm text-[#c8baa0]"}>{item === "draft" ? "Borradores" : "Publicadas"}</button>)}</div>
          <a href="/admin/guides" className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-3 py-2 text-sm text-[#efd79c]"><Plus className="size-4" /> Crear guía</a>
        </div>
        <div className="grid gap-3">
          {loading && <p className="text-[#b7a476]">Cargando guías…</p>}
          {!loading && error && <div className="flex flex-wrap items-center justify-between gap-3 border border-[#b85a5a] bg-[#35191a]/30 p-5 text-[#f1a0a0]"><p>{error}</p><a href="/admin/login" className="border border-[#e2b36e] px-3 py-2 text-sm text-[#f0d29b]">Iniciar sesión</a></div>}
          {!loading && !error && guides.length === 0 && <p className="border border-dashed border-[color:var(--line)] p-5 text-[#b7a476]">No hay guías {status === "draft" ? "en borrador" : "publicadas"}.</p>}
          {guides.map((guide) => <article key={guide.id} className="flex flex-wrap items-center justify-between gap-4 border border-[color:var(--line)] bg-[#0b1718] p-4"><div><p className="text-xs tracking-[.14em] text-[#b7a476]">{guide.status === "published" ? "PUBLICADA · " : "BORRADOR · "}{guide.subject?.collection ?? "GUÍA GENERAL"}</p><h2 className="mt-1 text-lg text-[#ead9ad]">{guide.title}</h2><p className="mt-1 text-sm text-[#c8baa0]">{guide.subject?.name ?? "Sin registro vinculado"}</p>{guide.updatedAt && <p className="mt-1 text-xs text-[#b7a476]">Actualizado: {new Date(guide.updatedAt).toLocaleString("es-MX")}</p>}</div><a href={`/admin/guides?id=${encodeURIComponent(guide.id)}`} className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-3 py-2 text-sm text-[#efd79c]"><FilePenLine className="size-4" /> Editar guía</a></article>)}
          {total > limit && <div className="flex items-center justify-between pt-3 text-sm text-[#b7a476]"><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="border border-[color:var(--line)] px-3 py-2 disabled:opacity-40">Anterior</button><span>Página {page + 1} de {pages}</span><button type="button" disabled={page >= pages - 1} onClick={() => setPage((current) => current + 1)} className="border border-[color:var(--line)] px-3 py-2 disabled:opacity-40">Siguiente</button></div>}
        </div>
      </section>
    </main>
  );
}
