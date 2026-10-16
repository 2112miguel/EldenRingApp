"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ImageIcon,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import type { CatalogueEntry, CatalogueResponse } from "../lib/elden-ring";
import { imageSource } from "../lib/elden-ring";

type EditableValue = string | number | boolean | null;
const pageSize = 20;
const protectedFields = new Set(["id", "_id", "name", "image", "description"]);
const invalidFieldName = (field: string) =>
  !field.trim() || field.includes(".") || field.startsWith("$");
const creationFieldsBySection: Record<string, Record<string, EditableValue>> = {
  Jefes: { region: "", healthPoints: "" },
  Objetos: {
    type: "",
    effect: "",
    obtainedFrom: null,
    fextralifePageUrl: null,
  },
  Talismanes: { type: "", effect: "", weight: null },
  Armas: { category: "", weight: null, skill: "" },
  Escudos: { category: "", weight: null, skill: "" },
  Munición: { type: "", effect: "" },
  Invocaciones: { effect: "", fpCost: null, hpCost: null },
  Hechicerías: { type: "", fpCost: null, slots: null, effect: "" },
  Encantamientos: { type: "", fpCost: null, slots: null, effect: "" },
  Clases: { isBaseGameStartingClass: true, contentSource: null, gameVersion: null },
};
const fieldLabel = (field: string) =>
  field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());

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
  "Clases",
  "NPCs",
];

export default function AdminDashboard() {
  const [section, setSection] = useState("Jefes");
  const [entries, setEntries] = useState<CatalogueEntry[]>([]);
  const [selected, setSelected] = useState<CatalogueEntry | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, EditableValue>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [newField, setNewField] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(
      `/api/catalogue?section=${encodeURIComponent(query.trim() ? "Todos" : section)}&page=${page}&limit=${pageSize}${query.trim() ? `&name=${encodeURIComponent(query.trim())}` : ""}`,
    )
      .then((response) => response.json())
      .then((result: CatalogueResponse) => {
        if (!alive) return;
        const data = result.data ?? [];
        setEntries(data);
        setTotal(result.total ?? data.length);
        select(data[0] ?? null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, query, section]);
  function select(entry: CatalogueEntry | null) {
    setCreating(false);
    setSelected(entry);
    setName(entry?.name ?? "");
    setImage(entry?.image ?? "");
    setDescription(entry?.description ?? "");
    const editable = Object.fromEntries(
      Object.entries(entry ?? {}).filter(
        ([key, value]) =>
          !protectedFields.has(key) &&
          (value === null ||
            ["string", "number", "boolean"].includes(typeof value)),
      ),
    ) as Record<string, EditableValue>;
    setExtraFields(editable);
    setMessage("");
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/");
  }
  async function save() {
    if (!selected && !creating) return;
    setSaving(true);
    setMessage("");
    try {
      if (!name.trim()) {
        setMessage("El nombre es obligatorio.");
        return;
      }
      const invalidField = Object.keys(extraFields).find(invalidFieldName);
      if (invalidField) {
        setMessage(
          `El campo “${invalidField}” no es válido: no puede contener “.” ni comenzar con “$”.`,
        );
        return;
      }
      const changes = {
        name: name.trim(),
        image: image || null,
        description: description || null,
        ...Object.fromEntries(
          Object.entries(extraFields).map(([key, value]) => [
            key,
            value === "" ? null : value,
          ]),
        ),
      };
      const response = await fetch("/api/admin/entries", {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          creating
            ? { section, values: changes }
            : {
                section: selected!.sourceSection ?? section,
                id: selected!.id,
                changes,
              },
        ),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        setMessage(result.error ?? "No se pudieron guardar los cambios.");
        return;
      }
      const updated = {
        ...(selected ?? {}),
        ...extraFields,
        id: creating ? result.id : selected!.id,
        name,
        image: image || null,
        description,
      } as CatalogueEntry;
      setEntries((current) =>
        creating
          ? [updated, ...current]
          : current.map((entry) =>
              entry.id === selected!.id ? updated : entry,
            ),
      );
      if (creating) setTotal((current) => current + 1);
      setSelected(updated);
      setCreating(false);
      setMessage("Cambios guardados.");
    } catch {
      setMessage("No fue posible conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (!selected || creating) return;
    const confirmation = `DELETE ${selected.name} [${selected.id}]`;
    if (!window.confirm(`¿Eliminar definitivamente “${selected.name}”?`))
      return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: selected.sourceSection ?? section,
          id: selected.id,
          confirmation,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        setMessage(result.error ?? "No se pudo eliminar el registro.");
        return;
      }
      setEntries((current) => current.filter((entry) => entry.id !== selected.id));
      setTotal((current) => Math.max(0, current - 1));
      select(null);
      setMessage("Registro eliminado.");
    } catch {
      setMessage("No fue posible conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }
  function startCreation() {
    setSelected(null);
    setCreating(true);
    setName("");
    setImage("");
    setDescription("");
    setExtraFields({ ...(creationFieldsBySection[section] ?? {}) });
    setMessage("");
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
            href="/admin/guides"
            className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"
          >
            <BookOpen className="size-4" />
            Guías
          </a>
          <a
            href="/admin/drafts"
            className="inline-flex items-center gap-2 border border-[color:var(--line)] px-3 py-2 text-sm text-[#d5c18b]"
          >
            <BookOpen className="size-4" />
            Gestionar guías
          </a>
          <button
            onClick={startCreation}
            className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-3 py-2 text-sm text-[#efd79c]"
          >
            <Plus className="size-4" />
            Nuevo
          </button>
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
              onClick={() => {
                setSection(item);
                setPage(0);
                setQuery("");
              }}
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
            {query.trim() ? "RESULTADOS" : section.toUpperCase()}
          </p>
          <label className="mb-4 flex items-center gap-2 border border-[color:var(--line)] bg-black/10 px-3 py-2">
            <Search className="size-4 text-[color:var(--gold)]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Buscar en todo el compendio..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a99d85]"
            />
          </label>
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
                  <span>
                    {entry.name}
                    {query.trim() && entry.sourceSection ? (
                      <small className="mt-1 block text-xs text-[#b7a476]">
                        {entry.sourceSection}
                      </small>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          )}
          {total > pageSize && (
            <div className="mt-5 flex items-center justify-between border-t border-[color:var(--line)] pt-4 text-sm text-[#bdb39e]">
              <button
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="border border-[color:var(--line)] px-3 py-2 disabled:opacity-40"
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(Math.ceil(total / pageSize) - 1, current + 1),
                  )
                }
                disabled={page >= Math.ceil(total / pageSize) - 1}
                className="border border-[color:var(--line)] px-3 py-2 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
        <section className="border border-[color:var(--line)] bg-[#0b1718] p-5">
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon className="size-5 text-[color:var(--gold)]" />
            <h2 className="text-xl">
              {creating ? "Nuevo registro" : "Editar registro"}
            </h2>
          </div>
          {selected || creating ? (
            <>
              {!creating && (
                <p className="mb-5 text-sm text-[#d5c18b]">{selected?.name}</p>
              )}
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
              {Object.entries(extraFields).map(([field, value]) => (
                <label key={field} className={`mt-4 grid gap-2 text-sm ${invalidFieldName(field) ? "text-red-300" : ""}`}>
                  <span className="flex items-center justify-between gap-3">{fieldLabel(field)}<button type="button" onClick={() => setExtraFields((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== field)))} className="text-xs text-red-300 hover:text-red-200">Quitar campo</button></span>
                  {invalidFieldName(field) && <span className="text-xs">El nombre no puede contener “.” ni comenzar con “$”.</span>}
                  {typeof value === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(event) =>
                        setExtraFields((current) => ({
                          ...current,
                          [field]: event.target.checked,
                        }))
                      }
                      className={`size-4 accent-[#d9bc7e] ${invalidFieldName(field) ? "outline outline-1 outline-red-400" : ""}`}
                    />
                  ) : (
                    <input
                      type={typeof value === "number" ? "number" : "text"}
                      value={value ?? ""}
                      onChange={(event) =>
                        setExtraFields((current) => ({
                          ...current,
                          [field]:
                            typeof value === "number"
                              ? Number(event.target.value)
                              : event.target.value,
                        }))
                      }
                      className={`border bg-transparent px-3 py-2 outline-none focus:border-[#d9bc7e] ${invalidFieldName(field) ? "border-red-400" : "border-[color:var(--line)]"}`}
                    />
                  )}
                </label>
              ))}
              {creating && (
                <div className="mt-4 flex gap-2">
                  <div className="min-w-0 flex-1">
                    <input
                      value={newField}
                      onChange={(event) => {
                        setNewField(event.target.value);
                        setMessage("");
                      }}
                      placeholder="Nombre técnico, ej. purchasedFrom"
                      className={`w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-[#d9bc7e] ${newField.trim() && invalidFieldName(newField) ? "border-red-400" : "border-[color:var(--line)]"}`}
                    />
                    <p className="mt-1 text-xs text-[#a99d85]">Aquí va el nombre del campo, no su contenido.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const field = newField.trim();
                      if (
                        invalidFieldName(field) ||
                        protectedFields.has(field)
                      ) {
                        setMessage(
                          "Usa un nombre técnico sin puntos ni $; después escribe el valor en el campo creado.",
                        );
                        return;
                      }
                      setExtraFields((current) => ({
                        ...current,
                        [field]: "",
                      }));
                      setNewField("");
                    }}
                    className="h-10 border border-[color:var(--line)] px-3 text-sm text-[#d5c18b]"
                  >
                    Añadir campo
                  </button>
                </div>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 border border-[color:var(--gold)] px-4 py-3 text-sm text-[#efd79c] disabled:cursor-wait disabled:opacity-60"
              >
                <Save className="size-4" />
                {saving
                  ? "Guardando…"
                  : creating
                    ? "Crear registro"
                    : "Guardar cambios"}
              </button>
              {!creating && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-red-400/60 px-4 py-3 text-sm text-red-200 disabled:opacity-60"
                >
                  <Trash2 className="size-4" /> Eliminar registro
                </button>
              )}
              {message && (
                <p
                  className={
                    message === "Cambios guardados."
                      ? "mt-3 text-xs text-emerald-300"
                      : "mt-3 text-xs text-red-300"
                  }
                >
                  {message}
                </p>
              )}
            </>
          ) : (
            <p className="text-[#bdb39e]">Selecciona un registro.</p>
          )}
        </section>
      </div>
    </main>
  );
}
