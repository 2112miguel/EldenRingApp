"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Backpack,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Crown,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  FlaskConical,
  Gift,
  Hammer,
  Heart,
  House,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ScrollText,
  Search,
  Shield,
  Shirt,
  Skull,
  Sparkles,
  Sun,
  Sword,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  imageSource,
  type Attribute,
  type CatalogueEntry,
  type CatalogueResponse,
  type Guide,
  type RecordReference,
} from "../lib/elden-ring";

type Section = { label: string; icon: LucideIcon };
type Group = { label: string; icon: LucideIcon; sections: Section[] };
type NavigationSnapshot = {
  entries: CatalogueEntry[];
  selectedId: string;
  section: string;
  page: number;
  total: number;
  query: string;
  linkedEntry: CatalogueEntry | null;
};
const sectionCollections: Record<string, string> = {
  Jefes: "bosses",
  Enemigos: "creatures",
  Armas: "weapons",
  Munición: "ammos",
  Armaduras: "armors",
  Escudos: "shields",
  Talismanes: "talismans",
  Objetos: "items",
  Invocaciones: "spirits",
  "Cenizas de guerra": "ashes",
  Hechicerías: "sorceries",
  Encantamientos: "incantations",
  Áreas: "locations",
  Clases: "classes",
  NPCs: "npcs",
};

const groups: Group[] = [
  {
    label: "Combate",
    icon: Crown,
    sections: [
      { label: "Jefes", icon: Crown },
      { label: "Enemigos", icon: Skull },
    ],
  },
  {
    label: "Arsenal",
    icon: Sword,
    sections: [
      { label: "Armas", icon: Sword },
      { label: "Munición", icon: Crosshair },
    ],
  },
  {
    label: "Equipo",
    icon: Shirt,
    sections: [
      { label: "Armaduras", icon: Shirt },
      { label: "Escudos", icon: Shield },
      { label: "Talismanes", icon: Sparkles },
      { label: "Objetos", icon: Package },
      { label: "Invocaciones", icon: Backpack },
      { label: "Cenizas de guerra", icon: FlaskConical },
    ],
  },
  {
    label: "Magia",
    icon: WandSparkles,
    sections: [
      { label: "Hechicerías", icon: WandSparkles },
      { label: "Encantamientos", icon: Flame },
    ],
  },
  {
    label: "Mundo",
    icon: MapPin,
    sections: [
      { label: "Áreas", icon: MapPin },
      { label: "Clases", icon: Dumbbell },
      { label: "NPCs", icon: Users },
    ],
  },
];
const pageSize = 10;
const collectionSections: Record<string, string> = {
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
const isNavigable = (
  reference: RecordReference,
): reference is RecordReference & { id: string } =>
  reference.kind === "record" && Boolean(reference.id);
const getApiPath = (reference: RecordReference) =>
  isNavigable(reference)
    ? `/api/${reference.collection}/${reference.id}`
    : null;

export default function Compendium({
  initialCatalogue,
}: {
  initialCatalogue: CatalogueResponse;
}) {
  const [entries, setEntries] = useState(initialCatalogue.data);
  const [selectedId, setSelectedId] = useState(
    initialCatalogue.data[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("Inicio");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(initialCatalogue.total);
  const [loading, setLoading] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkedEntry, setLinkedEntry] = useState<CatalogueEntry | null>(null);
  const [navigationStack, setNavigationStack] = useState<NavigationSnapshot[]>(
    [],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Combate: true,
    Arsenal: true,
    Equipo: true,
    Magia: true,
    Mundo: true,
  });
  const selected =
    entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const detailSection =
    activeSection === "Todos"
      ? (selected?.sourceSection ?? "Resultados")
      : activeSection;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collection = params.get("referenceCollection");
    const id = params.get("referenceId");
    const targetSection = collection ? collectionSections[collection] : undefined;
    if (!collection || !id || !targetSection) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/catalogue/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`)
      .then((response) => response.json())
      .then((result) => {
        if (!alive || !result.success || !result.data) return;
        setLinkedEntry(result.data as CatalogueEntry);
        setActiveSection(targetSection);
        setPage(0);
        setQuery("");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (linkedEntry) {
      setEntries([linkedEntry]);
      setSelectedId(linkedEntry.id);
      setTotal(1);
      setLoading(false);
      return;
    }
    if (activeSection === "Inicio") return;
    if (activeSection === "Jefes" && page === 0 && !query) {
      setEntries(initialCatalogue.data);
      setSelectedId(initialCatalogue.data[0]?.id ?? "");
      setTotal(initialCatalogue.total);
      setLoading(false);
      return;
    }
    let mounted = true;
    const params = new URLSearchParams({
      section: activeSection,
      page: String(page),
      limit: String(pageSize),
    });
    if (query.trim()) params.set("name", query.trim());
    fetch(`/api/catalogue?${params}`)
      .then((response) => response.json())
      .then((result: CatalogueResponse) => {
        if (!mounted) return;
        const nextEntries = result.data ?? [];
        setEntries(nextEntries);
        setSelectedId(nextEntries[0]?.id ?? "");
        setTotal(result.total ?? 0);
      })
      .catch(() => {
        if (mounted) {
          setEntries([]);
          setSelectedId("");
          setTotal(0);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [activeSection, initialCatalogue, linkedEntry, page, query]);
  useEffect(() => {
    const reveal = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCinematic(false);
    };
    window.addEventListener("keydown", reveal);
    return () => window.removeEventListener("keydown", reveal);
  }, []);
  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((result) => setIsAdmin(Boolean(result.authenticated)))
      .catch(() => setIsAdmin(false));
  }, []);
  useEffect(() => {
    const entry = entries.find((item) => item.id === selectedId);
    const sourceSection =
      activeSection === "Todos" ? entry?.sourceSection : activeSection;
    const collection = sourceSection
      ? sectionCollections[sourceSection]
      : undefined;
    if (!entry || !collection) return;
    let alive = true;
    fetch(`/api/catalogue/${collection}/${entry.id}`)
      .then((response) => response.json())
      .then((result) => {
        if (!alive || !result.success || !result.data) return;
        setEntries((current) =>
          current.map((item) =>
            item.id === entry.id
              ? { ...result.data, sourceSection: item.sourceSection }
              : item,
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [activeSection, selectedId]);

  const selectSection = (section: string) => {
    setLinkedEntry(null);
    setNavigationStack([]);
    setActiveSection(section);
    setPage(0);
    setQuery("");
    setLoading(section !== "Jefes");
    if (section === "Jefes") {
      setEntries(initialCatalogue.data);
      setSelectedId(initialCatalogue.data[0]?.id ?? "");
      setTotal(initialCatalogue.total);
    }
  };
  const openReference = async (reference: RecordReference) => {
    const apiPath = getApiPath(reference);
    const targetSection = collectionSections[reference.collection];
    if (!apiPath || !targetSection) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/catalogue/${reference.collection}/${reference.id}`,
      );
      const result = await response.json();
      if (!response.ok || !result.success || !result.data) return;
      setNavigationStack((current) => [
        ...current,
        {
          entries,
          selectedId,
          section: activeSection,
          page,
          total,
          query,
          linkedEntry,
        },
      ]);
      setLinkedEntry(result.data as CatalogueEntry);
      setActiveSection(targetSection);
      setPage(0);
      setQuery("");
    } finally {
      setLoading(false);
    }
  };
  const goBack = () => {
    const previous = navigationStack.at(-1);
    if (!previous) return;
    setNavigationStack((current) => current.slice(0, -1));
    setEntries(previous.entries);
    setSelectedId(previous.selectedId);
    setActiveSection(previous.section);
    setPage(previous.page);
    setTotal(previous.total);
    setQuery(previous.query);
    setLinkedEntry(previous.linkedEntry);
    setLoading(false);
  };
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
  };
  return (
    <>
      <video
        className="fixed inset-0 z-0 h-screen w-screen object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/erdtree-kingdom.png"
      >
        <source src="/video/elden-ring-leaves.webm" type="video/webm" />
      </video>
      <main
        className={
          isCinematic
            ? "compendium-shell relative z-10 pointer-events-none opacity-0 transition-opacity duration-500"
            : "compendium-shell relative z-10 transition-opacity duration-500"
        }
      >
        <aside className="rail">
          <div className="sigil" aria-hidden="true">
            ✧
          </div>
          <p className="brand">
            Tarnished <span>Compendium</span>
          </p>
          <nav className="main-nav" aria-label="Navegación principal">
            <button
              onClick={() => setActiveSection("Inicio")}
              className={
                activeSection === "Inicio" ? "nav-item active" : "nav-item"
              }
            >
              <House />
              Inicio
            </button>
            {groups.map((group) => (
              <div className="nav-group" key={group.label}>
                <button
                  className="nav-group-toggle"
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [group.label]: !current[group.label],
                    }))
                  }
                >
                  <group.icon />
                  <span>{group.label}</span>
                  <ChevronDown
                    className={
                      openGroups[group.label]
                        ? "group-chevron open"
                        : "group-chevron"
                    }
                  />
                </button>
                {openGroups[group.label] && (
                  <div className="subnav">
                    {group.sections.map((section) => (
                      <button
                        key={section.label}
                        onClick={() => selectSection(section.label)}
                        className={
                          activeSection === section.label
                            ? "nav-item sub-item active"
                            : "nav-item sub-item"
                        }
                      >
                        <section.icon />
                        {section.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="rail-erdtree">
            <span>✦</span>
          </div>
        </aside>
        <section className="content-area">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[color:var(--line)] bg-[#091314]/95 px-1 backdrop-blur-md">
            <div className="flex items-center gap-2 whitespace-nowrap text-base text-[#e5cf99]">
              <Sparkles className="size-5 text-[color:var(--gold)]" />
              <span>Tarnished Compendium</span>
            </div>
            <nav
              className="mr-auto flex items-center gap-1"
              aria-label="Navegación del compendio"
            >
              <button
                onClick={() => setActiveSection("Inicio")}
                className={
                  activeSection === "Inicio"
                    ? "border-b border-[color:var(--gold)] px-2.5 py-2 text-sm text-[#eed498]"
                    : "border-b border-transparent px-2.5 py-2 text-sm text-[#afa38d] hover:text-[#eed498]"
                }
              >
                Inicio
              </button>
              <button
                onClick={() => selectSection("Jefes")}
                className={
                  activeSection !== "Inicio"
                    ? "border-b border-[color:var(--gold)] px-2.5 py-2 text-sm text-[#eed498]"
                    : "border-b border-transparent px-2.5 py-2 text-sm text-[#afa38d] hover:text-[#eed498]"
                }
              >
                Compendio
              </button>
              <a
                href="/guides"
                className="inline-flex items-center gap-1 border-b border-transparent px-2.5 py-2 text-sm text-[#afa38d] hover:text-[#eed498]"
              >
                <BookOpen className="size-3.5" />
                Guías
              </a>
            </nav>
            <label className="flex h-10 w-[min(325px,42vw)] items-center gap-2 border border-[color:var(--line)] bg-[#040c0d]/60 px-3.5">
              <Search className="size-5 shrink-0 text-[color:var(--gold)]" />
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-[color:var(--paper)] outline-none placeholder:text-[#a69c8b]"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.trim()) {
                    setLinkedEntry(null);
                    setNavigationStack([]);
                    setActiveSection("Todos");
                    setLoading(true);
                  } else if (activeSection === "Todos") {
                    setActiveSection("Inicio");
                  }
                  setQuery(value);
                  setPage(0);
                }}
                placeholder="Buscar en la enciclopedia..."
              />
            </label>
            {isAdmin ? (
              <>
                <a
                  href="/admin"
                  className="inline-flex h-10 items-center gap-2 border border-[color:var(--line)] px-3 text-sm text-[#d5c18b] transition-colors hover:border-[color:var(--gold)] hover:text-[#efd79c]"
                  aria-label="Ir al panel de administración"
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden xl:inline">Panel</span>
                </a>
                <button
                  onClick={logout}
                  className="inline-flex h-10 items-center gap-2 border border-[color:var(--line)] px-3 text-sm text-[#d5c18b] transition-colors hover:border-red-300 hover:text-red-200"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                  <span className="hidden xl:inline">Salir</span>
                </button>
              </>
            ) : (
              <a
                href="/admin/login"
                className="inline-flex h-10 items-center gap-2 border border-[color:var(--line)] px-3 text-sm text-[#d5c18b] transition-colors hover:border-[color:var(--gold)] hover:text-[#efd79c]"
                aria-label="Acceso de administrador"
              >
                <KeyRound className="size-4" />
                <span className="hidden xl:inline">Admin</span>
              </a>
            )}
          </header>
          <div className="mobile-nav">
            {groups
              .flatMap((group) => group.sections)
              .map((section) => (
                <button
                  key={section.label}
                  onClick={() => selectSection(section.label)}
                  className={activeSection === section.label ? "active" : ""}
                >
                  {section.label}
                </button>
              ))}
          </div>
          {activeSection === "Inicio" ? (
            <HomePanel
              onOpenBosses={() => selectSection("Jefes")}
              onOpenArsenal={() => selectSection("Armas")}
              onOpenClasses={() => selectSection("Clases")}
            />
          ) : (
            <section className="dashboard">
              <aside className="catalogue panel">
                <div className="section-heading">
                  <h2>
                    {activeSection === "Todos" ? "Resultados" : activeSection}
                  </h2>
                </div>
                <p className="eyebrow">REGISTROS DISPONIBLES</p>
                <div className="boss-list">
                  {loading ? (
                    <p className="no-results">Invocando registros…</p>
                  ) : (
                    entries.map((entry) => (
                      <button
                        onClick={() => setSelectedId(entry.id)}
                        key={entry.id}
                        className={
                          entry.id === selected?.id
                            ? "boss-row selected"
                            : "boss-row"
                        }
                      >
                        <span className="boss-thumb">
                          <img
                            src={imageSource(entry.image)}
                            onError={(event) => {
                              event.currentTarget.src = imageSource();
                            }}
                            alt=""
                          />
                        </span>
                        <span>{entry.name}</span>
                      </button>
                    ))
                  )}
                  {!loading && !entries.length && (
                    <p className="no-results">
                      No hay registros para esta sección.
                    </p>
                  )}
                </div>
                {total > pageSize && (
                  <div className="pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPage((current) => Math.max(0, current - 1))
                      }
                      disabled={page === 0}
                      aria-label="Página anterior"
                    >
                      <ArrowLeft />
                    </Button>
                    <span>
                      Página {page + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages - 1, current + 1),
                        )
                      }
                      disabled={page >= totalPages - 1}
                      aria-label="Página siguiente"
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                )}
              </aside>
              {selected && (
                <Subject
                  entry={selected}
                  section={detailSection}
                  onBack={navigationStack.length ? goBack : undefined}
                />
              )}
              {selected && (
                <Details
                  entry={selected}
                  section={detailSection}
                  onOpenReference={openReference}
                />
              )}
            </section>
          )}
        </section>
      </main>
      <div
        className={
          isCinematic
            ? "relative z-10 mt-6 w-full bg-transparent pb-6 opacity-0 transition-opacity duration-500"
            : "relative z-10 mt-6 w-full bg-transparent pb-6 transition-opacity duration-500"
        }
      >
        <footer className="flex min-h-36 w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-[color:var(--line)] bg-[#081213]/90 px-8 py-8 text-xs leading-tight text-[#a99d85] md:px-20">
          <div className="flex items-center gap-2 text-[#d5c18b]">
            <Sparkles className="size-4 text-[color:var(--gold)]" />
            <span>Forjado en las Tierras Intermedias</span>
          </div>
          <p className="m-0">Diseñado y desarrollado por Miguel</p>
          <a
            className="flex items-center gap-0.5 text-[#ddc487] hover:text-[#f5dfa8]"
            href="https://github.com/2112miguel"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ChevronRight className="size-4" />
          </a>
          <button
            className="inline-flex items-center gap-1.5 text-[#a99d85] transition hover:text-[#efd79c]"
            onClick={() => setIsCinematic((current) => !current)}
            aria-pressed={isCinematic}
          >
            {isCinematic ? (
              <>
                <Eye className="size-3.5" />
                Mostrar interfaz
              </>
            ) : (
              <>
                <EyeOff className="size-3.5" />
                Modo contemplación
              </>
            )}
          </button>
        </footer>
      </div>
    </>
  );
}

function Subject({
  entry,
  section,
  onBack,
}: {
  entry: CatalogueEntry;
  section: string;
  onBack?: () => void;
}) {
  return (
    <section className="subject panel">
      <div className="subject-title">
        <p className="eyebrow">REGISTRO DE {section.toUpperCase()}</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-sm text-[#d8bc7f] hover:text-[#f0d99f]"
          >
            <ArrowLeft className="size-4" />
            Volver
          </button>
        )}
        <h1>{entry.name}</h1>
        <span>{entry.category || entry.type || section}</span>
      </div>
      <div className="portrait-stage">
        <div className="halo" />
        <img
          className="boss-portrait"
          src={imageSource(entry.image)}
          onError={(event) => {
            event.currentTarget.src = imageSource();
          }}
          alt={entry.name}
        />
      </div>
      <div className="portrait-caption">
        <span>Registro del compendio</span>
      </div>
    </section>
  );
}

function Details({
  entry,
  section,
  onOpenReference,
}: {
  entry: CatalogueEntry;
  section: string;
  onOpenReference: (reference: RecordReference) => void;
}) {
  const [activeTab, setActiveTab] = useState("Información");
  useEffect(() => setActiveTab("Información"), [entry.id]);
  const hasStrategy =
    section === "Jefes" || entry.guide?.status === "published";
  const tabs =
    section === "Jefes"
      ? ["Información", "Estrategia", "Galería"]
      : [
          "Información",
          ...(hasStrategy ? ["Estrategia"] : []),
          ...(entry.location ? ["Ubicación"] : []),
          "Galería",
        ];
  return (
    <aside className="details panel">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="compendium-tabs"
      >
        <TabsList variant="line" className="tabs">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Información">
          <div className="detail-content">
            <p className="description">
              {entry.description ||
                "No hay descripción disponible para este registro."}
            </p>
            <InfoRows entry={entry} section={section} />
            {(section === "Armas" ||
              section === "Escudos" ||
              section === "Armaduras") && (
              <EquipmentTables entry={entry} section={section} />
            )}
            {section === "Jefes" && (
              <BossInformation
                entry={entry}
                onOpenReference={onOpenReference}
              />
            )}
          </div>
        </TabsContent>
        {section !== "Jefes" && entry.location && (
          <TabsContent value="Ubicación">
            <div className="detail-content">
              <p className="description">
                {friendlyValue(entry.location, "Ubicación no registrada")}
              </p>
              <div className="map-card">
                <MapPin />
                <p>
                  Mapa y ruta detallada
                  <br />
                  <small>Disponible al publicar la guía</small>
                </p>
                <ChevronRight />
              </div>
            </div>
          </TabsContent>
        )}
        {hasStrategy && (
          <TabsContent value="Estrategia">
            <GuideStrategy
              entry={entry}
              section={section}
              active={activeTab === "Estrategia"}
            />
          </TabsContent>
        )}
        <TabsContent value="Galería">
          <div className="detail-content">
            <div className="gallery-card">
              <img
                src={imageSource(entry.image)}
                onError={(event) => {
                  event.currentTarget.src = imageSource();
                }}
                alt={entry.name}
              />
              <p>Imagen principal del registro</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function GuideStrategy({
  entry,
  section,
  active,
}: {
  entry: CatalogueEntry;
  section: string;
  active: boolean;
}) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!active || !entry.guide) return;
    const collection = sectionCollections[section];
    if (!collection) return;
    let alive = true;
    setLoading(true);
    setError("");
    fetch(`/api/guides/${collection}/${entry.id}`)
      .then((response) =>
        response.json().then((result) => ({ response, result })),
      )
      .then(({ response, result }) => {
        if (!alive) return;
        if (!response.ok || !result.success || !result.data) {
          setError("La guía no está disponible.");
          return;
        }
        setGuide(result.data as Guide);
      })
      .catch(() => {
        if (alive) setError("No fue posible cargar la guía.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [active, entry.guide, entry.id, section]);
  if (!entry.guide)
    return (
      <EmptyTab
        title="Estrategia en preparación"
        text="Este registro todavía no tiene una guía publicada."
      />
    );
  if (!active || loading)
    return (
      <div className="detail-content">
        <p className="value-muted">Cargando guía…</p>
      </div>
    );
  if (error || !guide)
    return (
      <EmptyTab
        title="Guía no disponible"
        text={error || "No fue posible cargar esta guía."}
      />
    );
  return (
    <div className="detail-content">
      <p className="eyebrow">GUÍA PUBLICADA</p>
      <h3 className="mb-3 text-2xl text-[#e8ddc5]">{guide.title}</h3>
      {guide.summary && <p className="description">{guide.summary}</p>}
      {guide.sections
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <section
            key={item.order}
            className="border-t border-[color:var(--line)] py-4"
          >
            <h4 className="text-lg text-[#e5cf99]">{item.title}</h4>
            <p className="mt-2 leading-relaxed text-[#cfc3ad]">
              {item.content}
            </p>
            {item.subsections
              ?.sort((a, b) => a.order - b.order)
              .map((subsection) => (
                <div
                  key={subsection.order}
                  className="mt-4 border-l border-[color:var(--line)] pl-4"
                >
                  <h5 className="text-base text-[#d8c998]">
                    {subsection.title}
                  </h5>
                  <p className="mt-1 leading-relaxed text-[#cfc3ad]">
                    {subsection.content}
                  </p>
                </div>
              ))}
          </section>
        ))}
      {guide.supplements && guide.supplements.length > 0 && (
        <section className="border-t border-[color:var(--line)] py-4">
          <h4 className="text-lg text-[#e5cf99]">Notas de la guía</h4>
          <div className="mt-3 grid gap-3">
            {guide.supplements.map((supplement) => (
              <article
                key={supplement.id}
                className="border border-[color:var(--line)] bg-black/10 p-4"
              >
                <p className="text-xs tracking-[.14em] text-[#b7a476]">
                  {supplement.type}
                </p>
                <h5 className="mt-1 text-base text-[#ead9ad]">
                  {supplement.title}
                </h5>
                <p className="mt-2 leading-relaxed text-[#cfc3ad]">
                  {supplement.content}
                </p>
                {supplement.image && (
                  <img
                    className="mt-3 max-h-72 w-full border border-[color:var(--line)] object-cover"
                    src={supplement.image}
                    alt={supplement.title}
                  />
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {guide.media
        ?.filter((media) => media.type === "image")
        .map((media) => (
          <img
            key={media.url}
            className="mt-4 w-full border border-[color:var(--line)]"
            src={media.url}
            alt={media.alt ?? "Imagen de la guía"}
          />
        ))}
    </div>
  );
}

function BossInformation({
  entry,
  onOpenReference,
}: {
  entry: CatalogueEntry;
  onOpenReference: (reference: RecordReference) => void;
}) {
  const location = entry.location ?? entry.region;
  const locationReference =
    isReference(entry.location) && isNavigable(entry.location)
      ? entry.location
      : null;
  return (
    <div className="boss-information">
      <section>
        <h3>Ubicación</h3>
        <div
          className={locationReference ? "map-card linked-card" : "map-card"}
          onClick={
            locationReference
              ? () => onOpenReference(locationReference)
              : undefined
          }
          onKeyDown={
            locationReference
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ")
                    onOpenReference(locationReference);
                }
              : undefined
          }
          role={locationReference ? "button" : undefined}
          tabIndex={locationReference ? 0 : undefined}
        >
          <MapPin />
          <p>
            {friendlyValue(location, "Ubicación no registrada")}
            <small>
              {entry.location
                ? "Ubicación documentada"
                : entry.region
                  ? "Región documentada"
                  : "Aún no documentada"}
            </small>
          </p>
          {locationReference ? (
            <ChevronRight aria-label={`Abrir ${locationReference.name}`} />
          ) : null}
        </div>
      </section>
      <section>
        <h3>Recompensas</h3>
        {entry.drops?.length ? (
          <div className="rewards">
            {entry.drops.map((drop, index) => {
              const reference =
                isReference(drop) && isNavigable(drop) ? drop : null;
              return (
                <div
                  className={reference ? "reward linked-card" : "reward"}
                  key={`${friendlyValue(drop, "recompensa")}-${index}`}
                  onClick={
                    reference ? () => onOpenReference(reference) : undefined
                  }
                  onKeyDown={
                    reference
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ")
                            onOpenReference(reference);
                        }
                      : undefined
                  }
                  role={reference ? "button" : undefined}
                  tabIndex={reference ? 0 : undefined}
                >
                  <Gift />
                  <p>
                    {friendlyValue(drop, "Sin recompensa conocida")}
                    <small>
                      {reference ? "Abrir registro" : "Recompensa documentada"}
                    </small>
                  </p>
                  {reference ? (
                    <ChevronRight aria-label={`Abrir ${reference.name}`} />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="inline-empty">
            Sin recompensas registradas para este jefe.
          </p>
        )}
      </section>
    </div>
  );
}

function InfoRows({
  entry,
  section,
}: {
  entry: CatalogueEntry;
  section: string;
}) {
  const rows = getInfoRows(entry, section);
  if (!rows.length)
    return (
      <EmptyTab
        title="Datos en preparación"
        text="Este tipo de registro no tiene atributos adicionales disponibles todavía."
      />
    );
  return (
    <div className="data-rows">
      {rows.map((row) => (
        <DataRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
        />
      ))}
    </div>
  );
}

function getInfoRows(entry: CatalogueEntry, section: string) {
  const effect = entry.effect || entry.effects;
  if (section === "Jefes")
    return [
      { icon: Heart, label: "Vida", value: mysticHealth(entry.healthPoints) },
      { icon: Crown, label: "Tipo", value: entry.category || "Jefe" },
    ];
  if (section === "Enemigos")
    return [
      {
        icon: Gift,
        label: "Drops",
        value: <TokenList items={entry.drops} fallback="Sin botín conocido" />,
      },
    ];
  if (section === "Objetos")
    return [
      {
        icon: Package,
        label: "Tipo",
        value: entry.type || "Sin clasificación",
      },
      {
        icon: Sparkles,
        label: "Efecto",
        value: friendlyValue(effect, "Efecto no registrado"),
      },
    ];
  if (section === "Invocaciones")
    return [
      { icon: Sparkles, label: "Coste de FP", value: `${entry.fpCost ?? "—"}` },
      { icon: Heart, label: "Coste de HP", value: `${entry.hpCost ?? "—"}` },
      {
        icon: Backpack,
        label: "Efecto",
        value: friendlyValue(effect, "Invocación sin efecto registrado"),
      },
    ];
  if (section === "Hechicerías" || section === "Encantamientos")
    return [
      { icon: Sparkles, label: "Tipo", value: entry.type || section },
      {
        icon: FlaskConical,
        label: "Coste de FP",
        value: `${entry.cost ?? "—"}`,
      },
      { icon: ScrollText, label: "Ranuras", value: `${entry.slots ?? "—"}` },
      {
        icon: Sparkles,
        label: "Efecto",
        value: friendlyValue(effect, "Efecto no registrado"),
      },
      {
        icon: Crosshair,
        label: "Requisitos",
        value: <AttributeTokens values={entry.requires} />,
      },
    ];
  if (section === "Munición")
    return [
      {
        icon: Crosshair,
        label: "Tipo",
        value: entry.type || "Sin clasificación",
      },
      {
        icon: Sparkles,
        label: "Efecto pasivo",
        value: friendlyValue(entry.passive, "Sin efecto pasivo conocido"),
      },
    ];
  if (section === "Talismanes")
    return [
      {
        icon: Sparkles,
        label: "Efecto",
        value: friendlyValue(effect, "Efecto no registrado"),
      },
    ];
  if (section === "Armaduras")
    return [
      { icon: Sword, label: "Tipo", value: entry.category || "Armadura" },
      {
        icon: Shield,
        label: "Peso",
        value: entry.weight === undefined ? "No registrado" : `${entry.weight}`,
      },
      { icon: Crosshair, label: "Requisitos", value: "Sin requisitos" },
    ];
  if (section === "Armas" || section === "Escudos")
    return equipmentRows(entry, section === "Escudos" ? "Escudo" : "Arma");
  if (section === "Cenizas de guerra")
    return [
      {
        icon: Sparkles,
        label: "Afinidad",
        value: entry.affinity || "Sin afinidad",
      },
      {
        icon: Sword,
        label: "Skill",
        value: entry.skill || "Sin skill registrada",
      },
      {
        icon: Sparkles,
        label: "Efecto",
        value: friendlyValue(effect, "Efecto no registrado"),
      },
    ];
  return [];
}

function equipmentRows(entry: CatalogueEntry, fallbackType: string) {
  return [
    { icon: Sword, label: "Tipo", value: entry.category || fallbackType },
    {
      icon: Shield,
      label: "Peso",
      value: entry.weight === undefined ? "No registrado" : `${entry.weight}`,
    },
    {
      icon: Crosshair,
      label: "Requisitos",
      value: <AttributeTokens values={entry.requiredAttributes} />,
    },
  ];
}
function EquipmentTables({
  entry,
  section,
}: {
  entry: CatalogueEntry;
  section: string;
}) {
  return (
    <div className="equipment-tables">
      {section === "Armaduras" ? (
        <>
          <AttributeTable
            title="Negación de daño"
            icon={Shield}
            values={entry.dmgNegation}
          />
          <AttributeTable
            title="Resistencias"
            icon={Heart}
            values={entry.resistance}
          />
        </>
      ) : (
        <>
          <AttributeTable
            title="Poder de ataque"
            icon={Sword}
            values={entry.attack}
          />
          <AttributeTable
            title="Defensa"
            icon={Shield}
            values={entry.defence}
          />
          <AttributeTable
            title="Escalado"
            icon={Sparkles}
            values={entry.scalesWith}
            scaling
          />
        </>
      )}
    </div>
  );
}
function AttributeTable({
  title,
  icon: Icon,
  values,
  scaling = false,
}: {
  title: string;
  icon: LucideIcon;
  values?: Attribute[];
  scaling?: boolean;
}) {
  const rows =
    values?.filter((value) =>
      scaling ? Boolean(value.scaling) : value.amount !== undefined,
    ) ?? [];
  if (!rows.length) return null;
  return (
    <section className="attribute-table">
      <h3>
        <Icon />
        {title}
      </h3>
      <div className="attribute-table-grid">
        {rows.map((value) => {
          const StatIcon = statIcon(value.name);
          return (
            <div className="attribute-table-row" key={value.name}>
              <span>
                <StatIcon />
                {statName(value.name)}
              </span>
              <strong>{scaling ? value.scaling : value.amount}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function isReference(value: unknown): value is RecordReference {
  return Boolean(value && typeof value === "object" && "name" in value);
}
function mysticHealth(value?: string | number) {
  const text = `${value ?? ""}`;
  return !text || text.trim() === "???" ? "Velada por la Niebla" : text;
}
function friendlyValue(value: unknown, fallback: string) {
  const text = isReference(value)
    ? value.name
    : typeof value === "string" || typeof value === "number"
      ? `${value}`
      : "";
  return !text || text.trim() === "-" || text.trim().toLowerCase() === "none"
    ? fallback
    : text;
}
function TokenList({
  items,
  fallback,
}: {
  items?: (string | RecordReference)[];
  fallback: string;
}) {
  const visible =
    items?.map((item) => friendlyValue(item, fallback)).filter(Boolean) ?? [];
  return (
    <span className="value-list">
      {visible.length ? (
        visible.map((item, index) => (
          <span className="value-token" key={`${item}-${index}`}>
            {item}
          </span>
        ))
      ) : (
        <span className="value-muted">{fallback}</span>
      )}
    </span>
  );
}
function AttributeTokens({
  values,
  includeZero = false,
}: {
  values?: Attribute[];
  includeZero?: boolean;
}) {
  const known =
    values?.filter(
      (value) =>
        Boolean(value.scaling) ||
        (includeZero
          ? value.amount !== undefined
          : value.amount !== undefined && value.amount > 0),
    ) ?? [];
  return known.length ? (
    <span className="stat-list">
      {known.map((value) => {
        const Icon = statIcon(value.name);
        const amount = value.amount ?? value.scaling;
        return (
          <span className="stat-token" key={value.name}>
            <Icon />
            <span>{statName(value.name)}</span>
            <b>{amount}</b>
          </span>
        );
      })}
    </span>
  ) : (
    <span className="value-muted">Sin requisitos</span>
  );
}
function statName(name: string) {
  return (
    (
      {
        Str: "Fuerza",
        Dex: "Destreza",
        Intelligence: "Inteligencia",
        Faith: "Fe",
        Arcane: "Arcano",
        Phy: "Físico",
        Mag: "Magia",
        Ligt: "Rayo",
        Holy: "Sagrado",
        Fire: "Fuego",
        Crit: "Crítico",
        Boost: "Impulso",
        Immunity: "Inmunidad",
        Robustness: "Robustez",
        Focus: "Enfoque",
        Vitality: "Vitalidad",
      } as Record<string, string>
    )[name] || name
  );
}
function statIcon(name: string): LucideIcon {
  return (
    (
      {
        Str: Dumbbell,
        Dex: Crosshair,
        Intelligence: Brain,
        Faith: Flame,
        Arcane: Eye,
        Phy: Sword,
        Strike: Hammer,
        Slash: Sword,
        Pierce: Crosshair,
        Mag: WandSparkles,
        Magic: WandSparkles,
        Fire: Flame,
        Ligt: Zap,
        Holy: Sun,
        Crit: Crosshair,
        Boost: Shield,
        Immunity: Shield,
        Robustness: Shield,
        Focus: Eye,
        Vitality: Heart,
      } as Record<string, LucideIcon>
    )[name] || Sparkles
  );
}
function HomePanel({
  onOpenBosses,
  onOpenArsenal,
  onOpenClasses,
}: {
  onOpenBosses: () => void;
  onOpenArsenal: () => void;
  onOpenClasses: () => void;
}) {
  return (
    <section className="home-panel panel">
      <div className="home-copy">
        <p className="eyebrow">EL ARCHIVO DE LAS TIERRAS INTERMEDIAS</p>
        <h1>La Gracia aún llama a los Sinluz.</h1>
        <p>
          Un compendio para recorrer las Tierras Intermedias: consulta enemigos,
          equipo, áreas y prepara tu travesía antes de cruzar la niebla.
        </p>
        <div className="home-actions">
          <Button onClick={onOpenBosses}>
            Explorar jefes <ChevronRight />
          </Button>
          <span>Archivo en expansión</span>
        </div>
      </div>
      <div className="home-stats">
        <div>
          <strong>13</strong>
          <span>catálogos</span>
        </div>
        <div>
          <strong>100+</strong>
          <span>registros por sección</span>
        </div>
        <div>
          <strong>Pronto</strong>
          <span>guías y misiones</span>
        </div>
      </div>
      <div className="home-sections">
        <article>
          <button onClick={onOpenBosses} className="p-0 text-left">
            <Crown />
            <h2>Jefes</h2>
            <p>Recompensas, vida y ubicación.</p>
          </button>
        </article>
        <article>
          <button onClick={onOpenArsenal} className="p-0 text-left">
            <Sword />
            <h2>Arsenal</h2>
            <p>Armas, escudos y munición.</p>
          </button>
        </article>
        <article>
          <a
            href="/guides"
            className="home-section-link block text-inherit no-underline"
            aria-label="Explorar guías"
          >
            <MapPin />
            <h2>Guías</h2>
            <p>Rutas y misiones hechas por la comunidad.</p>
          </a>
        </article>
        <article>
          <button onClick={onOpenClasses} className="p-0 text-left">
            <Dumbbell />
            <h2>Clases</h2>
            <p>Orígenes, atributos y equipo inicial.</p>
          </button>
        </article>
      </div>
    </section>
  );
}
function EmptyTab({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-tab">
      <Sparkles />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="data-row">
      <Icon />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
