import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ScrollToTop } from "./components/scroll-to-top";
import { headers } from "next/headers";
import { resolveLocale } from "./lib/locale";
import { LocaleProvider } from "./components/locale-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const instant = false;

export const metadata: Metadata = {
  title: "Tarnished Compendium | Elden Ring",
  description: "Enciclopedia y guías para los Sinluz.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("accept-language"));
  return <html lang={locale} className={cn("font-sans", geist.variable)}><body><LocaleProvider initialLocale={locale}>{children}<ScrollToTop /></LocaleProvider></body></html>;
}
