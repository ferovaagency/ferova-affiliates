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
    alert("Aliado creado. Se envio un magic link a " + form.email)
    router.push("/admin/aliados")
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Nuevo aliado</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre completo *</label>
          <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre del aliado" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="correo@aliado.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Telefono (WhatsApp) *</label>
          <input required value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="3001234567" />
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-700">El aliado recibira un magic link en su email para acceder al panel. Su link de referido se genera automaticamente.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Creando aliado..." : "Crear aliado y enviar acceso"}
        </button>
        <a href="/admin/aliados" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">
          Cancelar
        </a>
      </form>
    </main>
  )
}
