"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 border border-[color:var(--gold)] bg-[#071011]/95 px-3 py-2 text-sm text-[#efd79c] shadow-lg transition hover:bg-[#5e4722]/40"
      aria-label="Volver arriba"
    >
      <ArrowUp className="size-4" /> Subir
    </button>
  );
}
