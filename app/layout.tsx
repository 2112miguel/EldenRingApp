import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Tarnished Compendium | Elden Ring",
  description: "Enciclopedia y guías para los Sinluz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es" className={cn("font-sans", geist.variable)}><body>{children}</body></html>;
}
