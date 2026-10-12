"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) { setError(result.error || "No fue posible iniciar sesión."); setLoading(false); return; }
    window.location.assign("/admin");
  }

  return <main className="grid min-h-screen place-items-center bg-[#071011] p-6 text-[#e8ddc5]"><form onSubmit={submit} className="w-full max-w-sm border border-[color:var(--line)] bg-[#0b1718] p-8 shadow-2xl"><LockKeyhole className="mb-5 size-7 text-[color:var(--gold)]" /><p className="text-xs tracking-[.16em] text-[#b7a476]">ACCESO RESTRINGIDO</p><h1 className="mt-2 text-3xl">Panel del Compendio</h1><label className="mt-7 grid gap-2 text-sm">Correo<input required name="email" type="email" className="border border-[color:var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[#d9bc7e]" /></label><label className="mt-4 grid gap-2 text-sm">Contraseña<input required name="password" type="password" className="border border-[color:var(--line)] bg-transparent px-3 py-2.5 outline-none focus:border-[#d9bc7e]" /></label>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<button disabled={loading} className="mt-7 w-full border border-[color:var(--gold)] bg-[#5e4722]/40 px-4 py-3 text-sm text-[#efd79c] transition hover:bg-[#5e4722]/70 disabled:opacity-50">{loading ? "Verificando…" : "Iniciar sesión"}</button></form></main>;
}
