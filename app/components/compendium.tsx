"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, Backpack, Brain, ChevronDown, ChevronRight, Crosshair, Crown, Dumbbell, Eye, EyeOff, Flame, FlaskConical, Gift, Hammer, Heart, House, MapPin, Package, ScrollText, Search, Shield, Shirt, Skull, Sparkles, Sun, Sword, WandSparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Attribute, CatalogueEntry } from "../lib/elden-ring";

type Section = { label: string; icon: LucideIcon };
type Group = { label: string; icon: LucideIcon; sections: Section[] };

const groups: Group[] = [
  { label: "Combate", icon: Crown, sections: [{ label: "Jefes", icon: Crown }, { label: "Enemigos", icon: Skull }] },
  { label: "Arsenal", icon: Sword, sections: [{ label: "Armas", icon: Sword }, { label: "Munición", icon: Crosshair }] },
  { label: "Equipo", icon: Shirt, sections: [{ label: "Armaduras", icon: Shirt }, { label: "Escudos", icon: Shield }, { label: "Talismanes", icon: Sparkles }, { label: "Objetos", icon: Package }, { label: "Invocaciones", icon: Backpack }, { label: "Cenizas de guerra", icon: FlaskConical }] },
  { label: "Magia", icon: WandSparkles, sections: [{ label: "Hechicerías", icon: WandSparkles }, { label: "Encantamientos", icon: Flame }] },
  { label: "Mundo", icon: MapPin, sections: [{ label: "Áreas", icon: MapPin }] },
];
const pageSize = 10;

export default function Compendium({ bosses }: { bosses: CatalogueEntry[] }) {
  const [entries, setEntries] = useState(bosses);
  const [selectedId, setSelectedId] = useState(bosses[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("Jefes");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Combate: true, Arsenal: true, Equipo: true, Magia: true, Mundo: true });
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const filtered = useMemo(() => entries.filter((entry) => entry.name.toLowerCase().includes(query.toLowerCase())), [entries, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageEntries = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    if (activeSection === "Jefes") return;
    let mounted = true;
    fetch(`/api/catalogue?section=${encodeURIComponent(activeSection)}`).then((response) => response.json()).then((result: { data?: CatalogueEntry[] }) => {
      if (!mounted) return;
      const nextEntries = result.data ?? [];
      setEntries(nextEntries); setSelectedId(nextEntries[0]?.id ?? "");
    }).catch(() => { if (mounted) { setEntries([]); setSelectedId(""); } }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [activeSection]);
  useEffect(() => { const reveal = (event: KeyboardEvent) => { if (event.key === "Escape") setIsCinematic(false); }; window.addEventListener("keydown", reveal); return () => window.removeEventListener("keydown", reveal); }, []);

  const selectSection = (section: string) => {
    setActiveSection(section); setPage(0); setQuery(""); setLoading(section !== "Jefes");
    if (section === "Jefes") { setEntries(bosses); setSelectedId(bosses[0]?.id ?? ""); }
  };
  return <><video className="fixed inset-0 z-0 h-screen w-screen object-cover" autoPlay loop muted playsInline poster="/images/erdtree-kingdom.png"><source src="/video/elden-ring-leaves.webm" type="video/webm" /></video><main className={isCinematic ? "compendium-shell relative z-10 pointer-events-none opacity-0 transition-opacity duration-500" : "compendium-shell relative z-10 transition-opacity duration-500"}>
    <aside className="rail">
      <div className="sigil" aria-hidden="true">✧</div><p className="brand">Tarnished <span>Compendium</span></p>
      <nav className="main-nav" aria-label="Navegación principal">
        <button onClick={() => setActiveSection("Inicio")} className={activeSection === "Inicio" ? "nav-item active" : "nav-item"}><House />Inicio</button>
        {groups.map((group) => <div className="nav-group" key={group.label}><button className="nav-group-toggle" onClick={() => setOpenGroups((current) => ({ ...current, [group.label]: !current[group.label] }))}><group.icon /><span>{group.label}</span><ChevronDown className={openGroups[group.label] ? "group-chevron open" : "group-chevron"} /></button>{openGroups[group.label] && <div className="subnav">{group.sections.map((section) => <button key={section.label} onClick={() => selectSection(section.label)} className={activeSection === section.label ? "nav-item sub-item active" : "nav-item sub-item"}><section.icon />{section.label}</button>)}</div>}</div>)}
      </nav><div className="rail-erdtree"><span>✦</span></div>
    </aside>
    <section className="content-area">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-5 border-b border-[color:var(--line)] bg-[#091314]/95 px-1 backdrop-blur-md"><div className="flex items-center gap-2 whitespace-nowrap text-base text-[#e5cf99]"><Sparkles className="size-5 text-[color:var(--gold)]" /><span>Tarnished Compendium</span></div><nav className="mr-auto flex items-center gap-1" aria-label="Navegación del compendio"><button onClick={() => setActiveSection("Inicio")} className={activeSection === "Inicio" ? "border-b border-[color:var(--gold)] px-2.5 py-2 text-sm text-[#eed498]" : "border-b border-transparent px-2.5 py-2 text-sm text-[#afa38d] hover:text-[#eed498]"}>Inicio</button><button onClick={() => selectSection("Jefes")} className={activeSection !== "Inicio" ? "border-b border-[color:var(--gold)] px-2.5 py-2 text-sm text-[#eed498]" : "border-b border-transparent px-2.5 py-2 text-sm text-[#afa38d] hover:text-[#eed498]"}>Compendio</button></nav><label className="flex h-10 w-[min(325px,42vw)] items-center gap-2 border border-[color:var(--line)] bg-[#040c0d]/60 px-3.5"><Search className="size-5 shrink-0 text-[color:var(--gold)]" /><input className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-[color:var(--paper)] outline-none placeholder:text-[#a69c8b]" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Buscar en la enciclopedia..." /></label></header>
      <div className="mobile-nav">{groups.flatMap((group) => group.sections).map((section) => <button key={section.label} onClick={() => selectSection(section.label)} className={activeSection === section.label ? "active" : ""}>{section.label}</button>)}</div>
      {activeSection === "Inicio" ? <HomePanel onOpenBosses={() => selectSection("Jefes")} /> : <section className="dashboard">
        <aside className="catalogue panel"><div className="section-heading"><h2>{activeSection}</h2></div><p className="eyebrow">REGISTROS DISPONIBLES</p><div className="boss-list">{loading ? <p className="no-results">Invocando registros…</p> : pageEntries.map((entry) => <button onClick={() => setSelectedId(entry.id)} key={entry.id} className={entry.id === selected?.id ? "boss-row selected" : "boss-row"}><span className="boss-thumb"><img src={entry.image} alt="" /></span><span>{entry.name}</span></button>)}{!loading && !filtered.length && <p className="no-results">No hay registros con imagen para esta sección.</p>}</div>{filtered.length > pageSize && <div className="pagination"><Button variant="outline" size="icon" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="Página anterior"><ArrowLeft /></Button><span>Página {page + 1} de {totalPages}</span><Button variant="outline" size="icon" onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1} aria-label="Página siguiente"><ArrowRight /></Button></div>}</aside>
        {selected && <Subject entry={selected} section={activeSection} />}{selected && <Details entry={selected} section={activeSection} />}
      </section>}
    </section>
  </main><div className={isCinematic ? "relative z-10 mt-6 w-full bg-transparent pb-6 opacity-0 transition-opacity duration-500" : "relative z-10 mt-6 w-full bg-transparent pb-6 transition-opacity duration-500"}><footer className="flex min-h-36 w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-[color:var(--line)] bg-[#081213]/90 px-8 py-8 text-xs leading-tight text-[#a99d85] md:px-20"><div className="flex items-center gap-2 text-[#d5c18b]"><Sparkles className="size-4 text-[color:var(--gold)]" /><span>Forjado en las Tierras Intermedias</span></div><p className="m-0">Diseñado y desarrollado por Miguel</p><a className="flex items-center gap-0.5 text-[#ddc487] hover:text-[#f5dfa8]" href="https://github.com/2112miguel" target="_blank" rel="noreferrer">GitHub <ChevronRight className="size-4" /></a><button className="inline-flex items-center gap-1.5 text-[#a99d85] transition hover:text-[#efd79c]" onClick={() => setIsCinematic((current) => !current)} aria-pressed={isCinematic}>{isCinematic ? <><Eye className="size-3.5" />Mostrar interfaz</> : <><EyeOff className="size-3.5" />Modo contemplación</>}</button></footer></div></>;
}

function Subject({ entry, section }: { entry: CatalogueEntry; section: string }) { return <section className="subject panel"><div className="subject-title"><p className="eyebrow">REGISTRO DE {section.toUpperCase()}</p><h1>{entry.name}</h1><span>{entry.category || entry.type || section}</span></div><div className="portrait-stage"><div className="halo" /><img className="boss-portrait" src={entry.image} alt={entry.name} /></div><div className="portrait-caption"><span>Registro del compendio</span></div></section>; }

function Details({ entry, section }: { entry: CatalogueEntry; section: string }) {
  const tabs = section === "Jefes" ? ["Información", "Estrategia", "Galería"] : ["Información", ...(entry.location ? ["Ubicación"] : []), "Galería"];
  return <aside className="details panel"><Tabs defaultValue="Información" className="compendium-tabs"><TabsList variant="line" className="tabs">{tabs.map((tab) => <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>)}</TabsList>
    <TabsContent value="Información"><div className="detail-content"><p className="description">{entry.description || "No hay descripción disponible para este registro."}</p><InfoRows entry={entry} section={section} />{(section === "Armas" || section === "Escudos" || section === "Armaduras") && <EquipmentTables entry={entry} section={section} />}{section === "Jefes" && <BossInformation entry={entry} />}</div></TabsContent>
    {section !== "Jefes" && entry.location && <TabsContent value="Ubicación"><div className="detail-content"><p className="description">{entry.location}</p><div className="map-card"><MapPin /><p>Mapa y ruta detallada<br /><small>Disponible al publicar la guía</small></p><ChevronRight /></div></div></TabsContent>}
    {section === "Jefes" && <TabsContent value="Estrategia"><EmptyTab title="Estrategia en preparación" text="Este apartado se conectará con las guías curadas de la aplicación." /></TabsContent>}
    <TabsContent value="Galería"><div className="detail-content"><div className="gallery-card"><img src={entry.image} alt={entry.name} /><p>Imagen principal del registro</p></div></div></TabsContent>
  </Tabs></aside>;
}

function BossInformation({ entry }: { entry: CatalogueEntry }) { return <div className="boss-information">{entry.location && <section><h3>Ubicación</h3><div className="map-card"><MapPin /><p>{entry.location}<small>Ubicación documentada</small></p><ChevronRight /></div></section>}<section><h3>Recompensas</h3>{entry.drops?.length ? <div className="rewards">{entry.drops.map((drop) => <div className="reward" key={drop}><Gift /><p>{friendlyValue(drop, "Sin recompensa conocida")}<small>Recompensa documentada</small></p><ChevronRight /></div>)}</div> : <p className="inline-empty">Sin recompensas registradas para este jefe.</p>}</section></div>; }

function InfoRows({ entry, section }: { entry: CatalogueEntry; section: string }) {
  const rows = getInfoRows(entry, section);
  if (!rows.length) return <EmptyTab title="Datos en preparación" text="Este tipo de registro no tiene atributos adicionales disponibles todavía." />;
  return <div className="data-rows">{rows.map((row) => <DataRow key={row.label} icon={row.icon} label={row.label} value={row.value} />)}</div>;
}

function getInfoRows(entry: CatalogueEntry, section: string) {
  const effect = entry.effect || entry.effects;
  if (section === "Jefes") return [{ icon: Heart, label: "Vida", value: mysticHealth(entry.healthPoints) }, { icon: Crown, label: "Tipo", value: entry.category || "Jefe" }];
  if (section === "Enemigos") return [{ icon: Gift, label: "Drops", value: <TokenList items={entry.drops} fallback="Sin botín conocido" /> }];
  if (section === "Objetos") return [{ icon: Package, label: "Tipo", value: entry.type || "Sin clasificación" }, { icon: Sparkles, label: "Efecto", value: friendlyValue(effect, "Efecto no registrado") }];
  if (section === "Invocaciones") return [{ icon: Sparkles, label: "Coste de FP", value: `${entry.fpCost ?? "—"}` }, { icon: Heart, label: "Coste de HP", value: `${entry.hpCost ?? "—"}` }, { icon: Backpack, label: "Efecto", value: friendlyValue(effect, "Invocación sin efecto registrado") }];
  if (section === "Hechicerías" || section === "Encantamientos") return [{ icon: Sparkles, label: "Tipo", value: entry.type || section }, { icon: FlaskConical, label: "Coste de FP", value: `${entry.cost ?? "—"}` }, { icon: ScrollText, label: "Ranuras", value: `${entry.slots ?? "—"}` }, { icon: Sparkles, label: "Efecto", value: friendlyValue(effect, "Efecto no registrado") }, { icon: Crosshair, label: "Requisitos", value: <AttributeTokens values={entry.requires} /> }];
  if (section === "Munición") return [{ icon: Crosshair, label: "Tipo", value: entry.type || "Sin clasificación" }, { icon: Sparkles, label: "Efecto pasivo", value: friendlyValue(entry.passive, "Sin efecto pasivo conocido") }];
  if (section === "Talismanes") return [{ icon: Sparkles, label: "Efecto", value: friendlyValue(effect, "Efecto no registrado") }];
  if (section === "Armaduras") return [{ icon: Sword, label: "Tipo", value: entry.category || "Armadura" }, { icon: Shield, label: "Peso", value: entry.weight === undefined ? "No registrado" : `${entry.weight}` }, { icon: Crosshair, label: "Requisitos", value: "Sin requisitos" }];
  if (section === "Armas" || section === "Escudos") return equipmentRows(entry, section === "Escudos" ? "Escudo" : "Arma");
  if (section === "Cenizas de guerra") return [{ icon: Sparkles, label: "Afinidad", value: entry.affinity || "Sin afinidad" }, { icon: Sword, label: "Skill", value: entry.skill || "Sin skill registrada" }, { icon: Sparkles, label: "Efecto", value: friendlyValue(effect, "Efecto no registrado") }];
  return [];
}

function equipmentRows(entry: CatalogueEntry, fallbackType: string) { return [{ icon: Sword, label: "Tipo", value: entry.category || fallbackType }, { icon: Shield, label: "Peso", value: entry.weight === undefined ? "No registrado" : `${entry.weight}` }, { icon: Crosshair, label: "Requisitos", value: <AttributeTokens values={entry.requiredAttributes} /> }]; }
function EquipmentTables({ entry, section }: { entry: CatalogueEntry; section: string }) { return <div className="equipment-tables">{section === "Armaduras" ? <><AttributeTable title="Negación de daño" icon={Shield} values={entry.dmgNegation} /><AttributeTable title="Resistencias" icon={Heart} values={entry.resistance} /></> : <><AttributeTable title="Poder de ataque" icon={Sword} values={entry.attack} /><AttributeTable title="Defensa" icon={Shield} values={entry.defence} /><AttributeTable title="Escalado" icon={Sparkles} values={entry.scalesWith} scaling /></>}</div>; }
function AttributeTable({ title, icon: Icon, values, scaling = false }: { title: string; icon: LucideIcon; values?: Attribute[]; scaling?: boolean }) { const rows = values?.filter((value) => scaling ? Boolean(value.scaling) : value.amount !== undefined) ?? []; if (!rows.length) return null; return <section className="attribute-table"><h3><Icon />{title}</h3><div className="attribute-table-grid">{rows.map((value) => { const StatIcon = statIcon(value.name); return <div className="attribute-table-row" key={value.name}><span><StatIcon />{statName(value.name)}</span><strong>{scaling ? value.scaling : value.amount}</strong></div>; })}</div></section>; }
function mysticHealth(value?: string) { return !value || value.trim() === "???" ? "Velada por la Niebla" : value; }
function friendlyValue(value: string | undefined, fallback: string) { return !value || value.trim() === "-" || value.trim().toLowerCase() === "none" ? fallback : value; }
function TokenList({ items, fallback }: { items?: string[]; fallback: string }) { const visible = items?.map((item) => friendlyValue(item, fallback)).filter(Boolean) ?? []; return <span className="value-list">{visible.length ? visible.map((item) => <span className="value-token" key={item}>{item}</span>) : <span className="value-muted">{fallback}</span>}</span>; }
function AttributeTokens({ values, includeZero = false }: { values?: Attribute[]; includeZero?: boolean }) { const known = values?.filter((value) => Boolean(value.scaling) || (includeZero ? value.amount !== undefined : value.amount !== undefined && value.amount > 0)) ?? []; return known.length ? <span className="stat-list">{known.map((value) => { const Icon = statIcon(value.name); const amount = value.amount ?? value.scaling; return <span className="stat-token" key={value.name}><Icon /><span>{statName(value.name)}</span><b>{amount}</b></span>; })}</span> : <span className="value-muted">Sin requisitos</span>; }
function statName(name: string) { return ({ Str: "Fuerza", Dex: "Destreza", Intelligence: "Inteligencia", Faith: "Fe", Arcane: "Arcano", Phy: "Físico", Mag: "Magia", Ligt: "Rayo", Holy: "Sagrado", Fire: "Fuego", Crit: "Crítico", Boost: "Impulso", Immunity: "Inmunidad", Robustness: "Robustez", Focus: "Enfoque", Vitality: "Vitalidad" } as Record<string, string>)[name] || name; }
function statIcon(name: string): LucideIcon { return ({ Str: Dumbbell, Dex: Crosshair, Intelligence: Brain, Faith: Flame, Arcane: Eye, Phy: Sword, Strike: Hammer, Slash: Sword, Pierce: Crosshair, Mag: WandSparkles, Magic: WandSparkles, Fire: Flame, Ligt: Zap, Holy: Sun, Crit: Crosshair, Boost: Shield, Immunity: Shield, Robustness: Shield, Focus: Eye, Vitality: Heart } as Record<string, LucideIcon>)[name] || Sparkles; }
function HomePanel({ onOpenBosses }: { onOpenBosses: () => void }) { return <section className="home-panel panel"><div className="home-copy"><p className="eyebrow">EL ARCHIVO DE LAS TIERRAS INTERMEDIAS</p><h1>La Gracia aún llama a los Sinluz.</h1><p>Un compendio para recorrer las Tierras Intermedias: consulta enemigos, equipo, áreas y prepara tu travesía antes de cruzar la niebla.</p><div className="home-actions"><Button onClick={onOpenBosses}>Explorar jefes <ChevronRight /></Button><span>Archivo en expansión</span></div></div><div className="home-stats"><div><strong>13</strong><span>catálogos</span></div><div><strong>100+</strong><span>registros por sección</span></div><div><strong>Pronto</strong><span>guías y misiones</span></div></div><div className="home-sections"><article><Crown /><h2>Jefes</h2><p>Recompensas, vida y ubicación.</p></article><article><Sword /><h2>Arsenal</h2><p>Armas, escudos y munición.</p></article><article><MapPin /><h2>Guías</h2><p>Rutas y misiones hechas por la comunidad.</p></article></div></section>; }
function EmptyTab({ title, text }: { title: string; text: string }) { return <div className="empty-tab"><Sparkles /><h3>{title}</h3><p>{text}</p></div>; }
function DataRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) { return <div className="data-row"><Icon /><span>{label}</span><strong>{value}</strong></div>; }
