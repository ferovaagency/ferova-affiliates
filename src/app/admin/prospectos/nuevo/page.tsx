"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NuevoProspecto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", telefono: "", notas: "" })

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/prospectos/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, origen: "ferova" }),
    })
    const data = await res.json()
    if (data.error) { alert("Error: " + data.error); setLoading(false); return }
    alert("Prospecto creado y asignado a: " + (data.asignacion?.aliado_nombre ?? "aliado"))
    router.push("/admin/prospectos")
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Nuevo prospecto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre *</label>
          <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Empresa</label>
          <input value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre de la empresa" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Telefono *</label>
          <input required value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="3001234567" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="correo@empresa.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Notas para el aliado</label>
          <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" rows={3} placeholder="Contexto relevante sobre este prospecto..." />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Creando y asignando..." : "Crear y asignar automaticamente"}
        </button>
        <a href="/admin/prospectos" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">
          Cancelar
        </a>
      </form>
    </main>
  )
}
