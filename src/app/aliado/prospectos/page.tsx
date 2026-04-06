"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AliadorProspectos() {
  const [prospectos, setProspectos] = useState<any[]>([])
  const [filtroEstado, setFiltroEstado] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: aliadoData } = await supabase
      .from("aliados").select("id").eq("user_id", user.id).single()
    if (!aliadoData) return

    const { data: asignaciones } = await supabase
      .from("asignaciones")
      .select("id, resultado, fecha_asignacion, prospectos(id, nombre, empresa, telefono, email, notas, cargado_por)")
      .eq("aliado_id", aliadoData.id)
      .order("fecha_asignacion", { ascending: false })

    const todos = (asignaciones ?? []).map((a: any) => ({
      ...a.prospectos,
      asignacion_id: a.id,
      resultado: a.resultado,
    }))

    setProspectos(todos)
    setLoading(false)
  }

  async function marcarNoCerrado(asignacionId: string) {
    if (!confirm("Confirmas que no pudiste cerrar este prospecto?")) return
    await fetch("/api/prospectos/reasignar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asignacion_id: asignacionId }),
    })
    await cargarDatos()
  }

  const filtrados = prospectos.filter(p => {
    if (filtroEstado === "activo") return p.resultado === "activo"
    if (filtroEstado === "cerrado") return p.resultado === "cerrado"
    if (filtroEstado === "no_cerrado") return p.resultado === "no_cerrado"
    return true
  })

  if (loading) return <main className="p-4"><p className="text-sm text-gray-400">Cargando...</p></main>

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Mis prospectos</h1>
        <a href="/aliado/prospectos/nuevo" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl">+ Nuevo</a>
      </div>
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="cerrado">Cerrados</option>
          <option value="no_cerrado">No cerrados</option>
        </select>
        <button onClick={cargarDatos} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm">Recargar</button>
      </div>
      <p className="text-xs text-gray-400 mb-3">{filtrados.length} prospectos</p>
      <div className="space-y-3">
        {filtrados.map((p: any) => {
          const waUrl = "https://wa.me/57" + (p.telefono ?? "").replace(/\D/g, "")
          return (
            <div key={p.asignacion_id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.empresa ?? "Sin empresa"} - {p.telefono}</p>
                  {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                  {p.notas && <p className="text-xs text-gray-500 mt-1 italic">{p.notas}</p>}
                </div>
                <span className={"text-xs px-2 py-1 rounded-full " + (
                  p.resultado === "cerrado" ? "bg-green-50 text-green-700" :
                  p.resultado === "no_cerrado" ? "bg-red-50 text-red-700" :
                  "bg-blue-50 text-blue-700"
                )}>
                  {p.resultado === "cerrado" ? "Cerrado" : p.resultado === "no_cerrado" ? "No cerrado" : "Activo"}
                </span>
              </div>
              {p.resultado === "activo" && (
                <div className="flex gap-2 mt-3">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-500 text-white py-2 rounded-xl text-xs font-medium">WhatsApp</a>
                  <a href={"/aliado/registrar-cierre?asignacion=" + p.asignacion_id} className="flex-1 text-center bg-gray-900 text-white py-2 rounded-xl text-xs font-medium">Registrar venta</a>
                  <button onClick={() => marcarNoCerrado(p.asignacion_id)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs">No cerre</button>
                </div>
              )}
            </div>
          )
        })}
        {filtrados.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">No hay prospectos en este estado</p>
          </div>
        )}
      </div>
    </main>
  )
}
