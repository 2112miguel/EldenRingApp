export const supportedLocales = ["es-MX", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const localeCookieName = "tarnished_locale";

export function resolveLocale(value?: string | null): SupportedLocale {
  return value?.toLowerCase().startsWith("en") ? "en-US" : "es-MX";
}
