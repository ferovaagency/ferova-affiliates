"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function NuevoProspectoAliado() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", telefono: "", notas: "" })

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: aliado } = await supabase
      .from("aliados").select("id").eq("user_id", user.id).single()

    const { data: prospecto, error } = await supabase
      .from("prospectos")
      .insert({
        ...form,
        origen: "aliado",
        cargado_por: aliado?.id,
        estado: "asignado",
      })
      .select()
      .single()

    if (error) { alert("Error: " + error.message); setLoading(false); return }

    // Crear asignacion directa al mismo aliado
    await supabase.from("asignaciones").insert({
      prospecto_id: prospecto.id,
      aliado_id: aliado?.id,
    })

    alert("Prospecto creado y asignado a ti.")
    router.push("/aliado/prospectos")
  }

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Nuevo prospecto</h1>
      <div className="bg-blue-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-blue-700">Este prospecto quedara asignado a ti directamente y no se reasignara a otros aliados.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo *" />
        <input value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Empresa" />
        <input required value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Telefono *" />
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Email" />
        <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" rows={3} placeholder="Notas sobre este prospecto..." />
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Creando..." : "Crear prospecto"}
        </button>
        <a href="/aliado/prospectos" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">
          Cancelar
        </a>
      </form>
    </main>
  )
}
