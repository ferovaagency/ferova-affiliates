"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NuevoAliado() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" })

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/aliados/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.error) { alert("Error: " + data.error); setLoading(false); return }
    alert("Aliado creado exitosamente")
    router.push("/admin/aliados")
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Nuevo aliado</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo *" />
        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Email *" />
        <input required value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Telefono WhatsApp *" />
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Creando..." : "Crear aliado"}
        </button>
        <a href="/admin/aliados" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">Cancelar</a>
      </form>
    </main>
  )
}
