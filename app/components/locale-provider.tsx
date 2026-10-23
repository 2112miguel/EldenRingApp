"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SupportedLocale } from "../lib/locale";

type MessageKey = string;

const messages = {
  es: {
    "locale.es": "ES",
    "locale.en": "EN",
    "nav.home": "Inicio",
    "nav.compendium": "Compendio",
    "nav.guides": "Guías",
    "nav.signIn": "Iniciar sesión",
    "nav.account": "Cuenta",
    "nav.administration": "Administración",
    "nav.signOut": "Cerrar sesión",
    "search.placeholder": "Buscar en la enciclopedia...",
    "home.eyebrow": "EL ARCHIVO DE LAS TIERRAS INTERMEDIAS",
    "home.title": "La Gracia aún llama a los Sinluz.",
    "home.copy": "Un compendio para recorrer las Tierras Intermedias: consulta enemigos, equipo, áreas y prepara tu travesía antes de cruzar la niebla.",
    "home.exploreBosses": "Explorar jefes",
    "home.expanding": "Archivo en expansión",
    "home.catalogues": "catálogos",
    "home.records": "registros por sección",
    "home.comingSoon": "Pronto",
    "home.guidesMissions": "guías y misiones",
    "home.bosses": "Jefes",
    "home.bossesCopy": "Recompensas, vida y ubicación.",
    "home.arsenal": "Arsenal",
    "home.arsenalCopy": "Armas, escudos y munición.",
    "home.guides": "Guías",
    "home.guidesCopy": "Rutas y misiones hechas por la comunidad.",
    "home.classes": "Clases",
    "home.classesCopy": "Orígenes, atributos y equipo inicial.",
    "guides.eyebrow": "CRÓNICAS DE LAS TIERRAS INTERMEDIAS",
    "guides.title": "Guías",
    "guides.copy": "Estrategias, rutas y notas de viaje para avanzar con propósito entre la niebla.",
    "guides.back": "Volver al inicio",
    "guides.loading": "Cargando guías…",
    "guides.empty": "Aún no hay guías publicadas.",
    "guides.general": "GUÍA GENERAL",
    "guides.read": "Leer guía",
    "pagination.previous": "Anterior",
    "pagination.next": "Siguiente",
    "pagination.page": "Página",
    "scroll.top": "Subir",
    "group.Combate": "Combate", "group.Arsenal": "Arsenal", "group.Equipo": "Equipo", "group.Magia": "Magia", "group.Mundo": "Mundo",
    "section.Jefes": "Jefes", "section.Enemigos": "Enemigos", "section.Armas": "Armas", "section.Munición": "Munición", "section.Armaduras": "Armaduras", "section.Escudos": "Escudos", "section.Talismanes": "Talismanes", "section.Objetos": "Objetos", "section.Invocaciones": "Invocaciones", "section.Cenizas de guerra": "Cenizas de guerra", "section.Hechicerías": "Hechicerías", "section.Encantamientos": "Encantamientos", "section.Áreas": "Áreas", "section.Clases": "Clases", "section.NPCs": "NPCs",
    "catalogue.available": "REGISTROS DISPONIBLES", "catalogue.loading": "Invocando registros…", "catalogue.empty": "No hay registros para esta sección.", "catalogue.results": "Resultados", "catalogue.recordOf": "REGISTRO DE", "catalogue.record": "Registro del compendio", "catalogue.back": "Volver",
    "detail.info": "Información", "detail.strategy": "Estrategia", "detail.gallery": "Galería", "detail.location": "Ubicación", "detail.noDescription": "No hay descripción disponible para este registro.", "detail.locationMissing": "Ubicación no registrada", "detail.mapRoute": "Mapa y ruta detallada", "detail.guidePending": "Disponible al publicar la guía", "detail.mainImage": "Imagen principal del registro",
    "boss.rewards": "Recompensas", "boss.locationDocumented": "Ubicación documentada", "boss.regionDocumented": "Región documentada", "boss.notDocumented": "Aún no documentada", "boss.openRecord": "Abrir registro", "boss.rewardDocumented": "Recompensa documentada", "boss.noRewards": "Sin recompensas registradas para este jefe.",
    "info.Vida": "Vida", "info.Tipo": "Tipo", "info.Efecto": "Efecto", "info.Peso": "Peso", "info.Requisitos": "Requisitos", "info.Ranuras": "Ranuras", "info.Coste de FP": "Coste de FP", "info.Coste de HP": "Coste de HP", "info.Afinidad": "Afinidad", "info.Skill": "Habilidad", "info.Efecto pasivo": "Efecto pasivo", "info.Drops": "Botín",
    "empty.title": "Datos en preparación", "empty.copy": "Este tipo de registro no tiene atributos adicionales disponibles todavía.", "class.stats": "Estadísticas iniciales", "class.equipment": "Equipo inicial", "class.verify": "Inventario en verificación", "class.viewDetail": "Ver detalle", "class.related": "Registro relacionado",
    "stat.level": "Nivel", "stat.vigor": "Vigor", "stat.mind": "Mente", "stat.endurance": "Resistencia", "stat.strength": "Fuerza", "stat.dexterity": "Destreza", "stat.intelligence": "Inteligencia", "stat.faith": "Fe", "stat.arcane": "Arcano",
    "equipment.weapons": "Armas", "equipment.shields": "Escudos", "equipment.armors": "Armaduras", "equipment.ammos": "Munición", "equipment.ammunition": "Munición", "equipment.sorceries": "Hechicerías", "equipment.spells": "Hechizos", "equipment.incantations": "Encantamientos", "equipment.spirits": "Invocaciones", "equipment.skills": "Habilidades", "equipment.ashes": "Habilidades", "equipment.staffs": "Báculos", "equipment.sacredSeals": "Sellos sagrados", "equipment.consumables": "Consumibles",
    "table.damageNegation": "Negación de daño", "table.resistances": "Resistencias", "table.attackPower": "Poder de ataque", "table.defense": "Defensa", "table.scaling": "Escalado", "attribute.none": "Sin requisitos",
    "stat.Str": "Fuerza", "stat.Dex": "Destreza", "stat.Intelligence": "Inteligencia", "stat.Faith": "Fe", "stat.Arcane": "Arcano", "stat.Phy": "Físico", "stat.Strike": "Golpe", "stat.Slash": "Corte", "stat.Pierce": "Perforación", "stat.Mag": "Magia", "stat.Magic": "Magia", "stat.Fire": "Fuego", "stat.Ligt": "Rayo", "stat.Holy": "Sagrado", "stat.Crit": "Crítico", "stat.Boost": "Impulso", "stat.Immunity": "Inmunidad", "stat.Robustness": "Robustez", "stat.Focus": "Enfoque", "stat.Vitality": "Vitalidad",
  },
  en: {
    "locale.es": "ES",
    "locale.en": "EN",
    "nav.home": "Home",
    "nav.compendium": "Compendium",
    "nav.guides": "Guides",
    "nav.signIn": "Sign in",
    "nav.account": "Account",
    "nav.administration": "Administration",
    "nav.signOut": "Sign out",
    "search.placeholder": "Search the compendium...",
    "home.eyebrow": "THE ARCHIVE OF THE LANDS BETWEEN",
    "home.title": "Grace still calls to the Tarnished.",
    "home.copy": "A compendium for travelling the Lands Between: explore enemies, equipment, areas, and prepare before crossing the fog.",
    "home.exploreBosses": "Explore bosses",
    "home.expanding": "Archive expanding",
    "home.catalogues": "catalogues",
    "home.records": "records per section",
    "home.comingSoon": "Soon",
    "home.guidesMissions": "guides and quests",
    "home.bosses": "Bosses",
    "home.bossesCopy": "Rewards, health, and location.",
    "home.arsenal": "Arsenal",
    "home.arsenalCopy": "Weapons, shields, and ammunition.",
    "home.guides": "Guides",
    "home.guidesCopy": "Routes and quests created by the community.",
    "home.classes": "Classes",
    "home.classesCopy": "Origins, attributes, and starting equipment.",
    "guides.eyebrow": "CHRONICLES OF THE LANDS BETWEEN",
    "guides.title": "Guides",
    "guides.copy": "Strategies, routes, and travel notes to move with purpose through the fog.",
    "guides.back": "Back to home",
    "guides.loading": "Loading guides…",
    "guides.empty": "There are no published guides yet.",
    "guides.general": "GENERAL GUIDE",
    "guides.read": "Read guide",
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    "pagination.page": "Page",
    "scroll.top": "Back to top",
    "group.Combate": "Combat", "group.Arsenal": "Arsenal", "group.Equipo": "Equipment", "group.Magia": "Magic", "group.Mundo": "World",
    "section.Jefes": "Bosses", "section.Enemigos": "Enemies", "section.Armas": "Weapons", "section.Munición": "Ammunition", "section.Armaduras": "Armor", "section.Escudos": "Shields", "section.Talismanes": "Talismans", "section.Objetos": "Items", "section.Invocaciones": "Summons", "section.Cenizas de guerra": "Ashes of War", "section.Hechicerías": "Sorceries", "section.Encantamientos": "Incantations", "section.Áreas": "Areas", "section.Clases": "Classes", "section.NPCs": "NPCs",
    "catalogue.available": "AVAILABLE RECORDS", "catalogue.loading": "Summoning records…", "catalogue.empty": "There are no records in this section.", "catalogue.results": "Results", "catalogue.recordOf": "RECORD OF", "catalogue.record": "Compendium record", "catalogue.back": "Back",
    "detail.info": "Information", "detail.strategy": "Strategy", "detail.gallery": "Gallery", "detail.location": "Location", "detail.noDescription": "No description is available for this record.", "detail.locationMissing": "Location not documented", "detail.mapRoute": "Map and detailed route", "detail.guidePending": "Available when the guide is published", "detail.mainImage": "Main record image",
    "boss.rewards": "Rewards", "boss.locationDocumented": "Location documented", "boss.regionDocumented": "Region documented", "boss.notDocumented": "Not documented yet", "boss.openRecord": "Open record", "boss.rewardDocumented": "Reward documented", "boss.noRewards": "No rewards have been documented for this boss.",
    "info.Vida": "Health", "info.Tipo": "Type", "info.Efecto": "Effect", "info.Peso": "Weight", "info.Requisitos": "Requirements", "info.Ranuras": "Slots", "info.Coste de FP": "FP cost", "info.Coste de HP": "HP cost", "info.Afinidad": "Affinity", "info.Skill": "Skill", "info.Efecto pasivo": "Passive effect", "info.Drops": "Drops",
    "empty.title": "Data in preparation", "empty.copy": "This record type has no additional attributes available yet.", "class.stats": "Starting stats", "class.equipment": "Starting equipment", "class.verify": "Inventory under review", "class.viewDetail": "View details", "class.related": "Related record",
    "stat.level": "Level", "stat.vigor": "Vigor", "stat.mind": "Mind", "stat.endurance": "Endurance", "stat.strength": "Strength", "stat.dexterity": "Dexterity", "stat.intelligence": "Intelligence", "stat.faith": "Faith", "stat.arcane": "Arcane",
    "equipment.weapons": "Weapons", "equipment.shields": "Shields", "equipment.armors": "Armor", "equipment.ammos": "Ammunition", "equipment.ammunition": "Ammunition", "equipment.sorceries": "Sorceries", "equipment.spells": "Spells", "equipment.incantations": "Incantations", "equipment.spirits": "Summons", "equipment.skills": "Skills", "equipment.ashes": "Skills", "equipment.staffs": "Staves", "equipment.sacredSeals": "Sacred seals", "equipment.consumables": "Consumables",
    "table.damageNegation": "Damage negation", "table.resistances": "Resistances", "table.attackPower": "Attack power", "table.defense": "Defense", "table.scaling": "Scaling", "attribute.none": "No requirements",
    "stat.Str": "Strength", "stat.Dex": "Dexterity", "stat.Intelligence": "Intelligence", "stat.Faith": "Faith", "stat.Arcane": "Arcane", "stat.Phy": "Physical", "stat.Strike": "Strike", "stat.Slash": "Slash", "stat.Pierce": "Pierce", "stat.Mag": "Magic", "stat.Magic": "Magic", "stat.Fire": "Fire", "stat.Ligt": "Lightning", "stat.Holy": "Holy", "stat.Crit": "Critical", "stat.Boost": "Boost", "stat.Immunity": "Immunity", "stat.Robustness": "Robustness", "stat.Focus": "Focus", "stat.Vitality": "Vitality",
  },
} as const;

type LocaleContextValue = {
  locale: SupportedLocale;
  t: (key: MessageKey) => string;
  setLocale: (locale: SupportedLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: SupportedLocale; children: ReactNode }) {
  const [locale, updateLocale] = useState<SupportedLocale>(initialLocale);
  const setLocale = (nextLocale: SupportedLocale) => {
    updateLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    void fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
  };
  const language = locale.startsWith("en") ? "en" : "es";
  return <LocaleContext.Provider value={{ locale, t: (key) => messages[language][key as keyof typeof messages.es] ?? key, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider.");
  return context;
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <div className="inline-flex h-10 items-center border border-[color:var(--line)] text-xs text-[#d5c18b]" aria-label="Language selector">
    <button type="button" onClick={() => setLocale("es-MX")} className={locale === "es-MX" ? "h-full bg-[#5e4722]/30 px-2 text-[#efd79c]" : "h-full px-2 hover:text-[#efd79c]"}>{t("locale.es")}</button>
    <span className="text-[#665c4b]">/</span>
    <button type="button" onClick={() => setLocale("en-US")} className={locale === "en-US" ? "h-full bg-[#5e4722]/30 px-2 text-[#efd79c]" : "h-full px-2 hover:text-[#efd79c]"}>{t("locale.en")}</button>
  </div>;
}
