"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ImageIcon, LogOut, Save } from "lucide-react";
import type { CatalogueEntry, CatalogueResponse } from "../lib/elden-ring";
import { imageSource } from "../lib/elden-ring";

const sections = [
  "Jefes",
  "Enemigos",
  "Armas",
  "Munición",
  "Armaduras",
  "Escudos",
  "Talismanes",
  "Objetos",
  "Invocaciones",
  "Cenizas de guerra",
  "Hechicerías",
  "Encantamientos",
  "Áreas",
];

export default function AdminDashboard() {
  const [section, setSection] = useState("Jefes");
  const [entries, setEntries] = useState<CatalogueEntry[]>([]);
  const [selected, setSelected] = useState<CatalogueEntry | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(
      `/api/catalogue?section=${encodeURIComponent(section)}&page=0&limit=20`,
    )
      .then((response) => response.json())
      .then((result: CatalogueResponse) => {
        if (!alive) return;
        const data = result.data ?? [];
        setEntries(data);
        select(data[0] ?? null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [section]);
  function select(entry: CatalogueEntry | null) {
    setSelected(entry);
    setName(entry?.name ?? "");
    setImage(entry?.image ?? "");
    setDescription(entry?.description ?? "");
    setMessage("");
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/");
  }
  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    try {
      const changes = {
        name,
        image: image || null,
        description: description || null,
      };
      const response = await fetch("/api/admin/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, id: selected.id, changes }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        setMessage(result.error ?? "No se pudieron guardar los cambios.");
        return;
      }
      const updated = { ...selected, name, image: image || null, description };
      setEntries((current) =>
        current.map((entry) => (entry.id === selected.id ? updated : entry)),
      );
      setSelected(updated);
      setMessage("Cambios guardados.");
    } catch {
      setMessage("No fue posible conectar con el servidor.");
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
          <h1 className="mt-1 text-3xl">Tarnished Compendium</h1>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"
          >
            <ArrowLeft className="size-4" />
            Ver sitio
          </a>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_minmax(320px,.9fr)]">
        <aside className="border border-[color:var(--line)] bg-[#0b1718] p-3">
          <p className="mb-3 text-xs tracking-[.14em] text-[#b7a476]">
            COLECCIONES
          </p>
          {sections.map((item) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={
                section === item
                  ? "mb-1 w-full border-l-2 border-[color:var(--gold)] bg-[#5e4722]/30 px-3 py-2 text-left"
                  : "mb-1 w-full px-3 py-2 text-left text-[#bdb39e] hover:bg-white/5"
              }
            >
              {item}
            </button>
          ))}
        </aside>
        <section className="border border-[color:var(--line)] bg-[#0b1718] p-4">
          <p className="mb-4 text-xs tracking-[.14em] text-[#b7a476]">
            {section.toUpperCase()}
          </p>
          {loading ? (
            <p className="text-[#bdb39e]">Cargando registros…</p>
          ) : (
            <div className="grid gap-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => select(entry)}
                  className={
                    selected?.id === entry.id
                      ? "flex items-center gap-3 border border-[color:var(--gold)] bg-[#5e4722]/20 p-2 text-left"
                      : "flex items-center gap-3 border border-transparent p-2 text-left hover:bg-white/5"
                  }
                >
                  <img
                    className="size-12 object-cover"
                    src={imageSource(entry.image)}
                    alt=""
                  />
                  <span>{entry.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="border border-[color:var(--line)] bg-[#0b1718] p-5">
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon className="size-5 text-[color:var(--gold)]" />
            <h2 className="text-xl">Editar registro</h2>
          </div>
          {selected ? (
            <>
              <p className="mb-5 text-sm text-[#d5c18b]">{selected.name}</p>
              <label className="mb-4 grid gap-2 text-sm">
                Nombre
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[#d9bc7e]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                URL de imagen
                <input
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  className="border border-[color:var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[#d9bc7e]"
                />
              </label>
              <img
                className="my-4 h-36 w-full border border-[color:var(--line)] object-contain"
                src={imageSource(image)}
                onError={(event) => {
                  event.currentTarget.src = imageSource();
                }}
                alt="Vista previa"
              />
              <label className="grid gap-2 text-sm">
                Descripción
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={7}
                  className="resize-y border border-[color:var(--line)] bg-transparent px-3 py-2 outline-none focus:border-[#d9bc7e]"
                />
              </label>
              <button
                onClick={save}
                disabled={saving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 border border-[color:var(--gold)] px-4 py-3 text-sm text-[#efd79c] disabled:cursor-wait disabled:opacity-60"
              >
                <Save className="size-4" />
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              {message && <p className={message === "Cambios guardados." ? "mt-3 text-xs text-emerald-300" : "mt-3 text-xs text-red-300"}>{message}</p>}
            </>
          ) : (
            <p className="text-[#bdb39e]">Selecciona un registro.</p>
          )}
        </section>
      </div>
    </main>
  );
}
