"use client"
import { useEffect, useState } from "react"

export default function AdminProspectos() {
  const [prospectos, setProspectos] = useState<any[]>([])
  const [aliados, setAliados] = useState<any[]>([])
  const [filtroAliado, setFiltroAliado] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [loading, setLoading] = useState(true)
  const [asignando, setAsignando] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const [p, a] = await Promise.all([
      fetch("/api/prospectos/listar").then(r => r.json()),
      fetch("/api/aliados/listar").then(r => r.json()),
    ])
    setProspectos(p.prospectos ?? [])
    setAliados(a.aliados ?? [])
    setLoading(false)
  }

  async function asignarManual(prospectoId: string, aliadoId: string) {
    setAsignando(prospectoId)
    await fetch("/api/prospectos/asignar-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospecto_id: prospectoId, aliado_id: aliadoId }),
    })
    await cargarDatos()
    setAsignando(null)
  }

  async function reasignarAleatorio(prospectoId: string) {
    setAsignando(prospectoId)
    await fetch("/api/prospectos/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospecto_id: prospectoId, reasignar: true }),
    })
    await cargarDatos()
    setAsignando(null)
  }

  async function asignar10NuevoAliado(aliadoId: string) {
    await fetch("/api/prospectos/asignar-lote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aliado_id: aliadoId, cantidad: 10 }),
    })
    await cargarDatos()
  }

  const prospectosFiltrados = prospectos.filter(p => {
    if (filtroEstado && p.estado !== filtroEstado) return false
    if (filtroAliado) {
      const asignacionActiva = p.asignaciones?.find((a: any) => a.resultado === "activo")
      if (!asignacionActiva || asignacionActiva.aliado_id !== filtroAliado) return false
    }
    return true
  })

  if (loading) return <main className="p-6"><p className="text-sm text-gray-400">Cargando...</p></main>

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Prospectos</h1>
        <div className="flex gap-2">
          <a href="/admin/prospectos/importar" className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl">Importar CSV</a>
          <a href="/admin/prospectos/nuevo" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl">+ Nuevo</a>
        </div>
      </div>

      {/* Asignar 10 a aliados sin prospectos */}
      {aliados.filter((a: any) => a.prospectos_activos < 10).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-amber-800 mb-3">Aliados con menos de 10 prospectos asignados</p>
          <div className="space-y-2">
            {aliados.filter((a: any) => a.prospectos_activos < 10).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.nombre}</p>
                  <p className="text-xs text-gray-500">{a.prospectos_activos} prospectos activos</p>
                </div>
                <button
                  onClick={() => asignar10NuevoAliado(a.id)}
                  className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  Asignar {10 - a.prospectos_activos} prospectos
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <select
          value={filtroAliado}
          onChange={e => setFiltroAliado(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1"
        >
          <option value="">Todos los aliados</option>
          {aliados.map((a: any) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1"
        >
          <option value="">Todos los estados</option>
          <option value="sin_asignar">Sin asignar</option>
          <option value="asignado">Asignado</option>
          <option value="cerrado">Cerrado</option>
          <option value="perdido">Perdido</option>
        </select>
        <button onClick={cargarDatos} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm">
          Recargar
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">{prospectosFiltrados.length} prospectos</p>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {prospectosFiltrados.map((p: any) => {
            const asignacionActiva = p.asignaciones?.find((a: any) => a.resultado === "activo")
            const aliadoActual = asignacionActiva ? aliados.find((a: any) => a.id === asignacionActiva.aliado_id) : null

            return (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.empresa ?? "Sin empresa"} · {p.telefono}</p>
                    {aliadoActual && (
                      <p className="text-xs text-blue-600 mt-0.5">Asignado a: {aliadoActual.nombre}</p>
                    )}
                  </div>
                  <span className={"text-xs px-2 py-1 rounded-full " + (
                    p.estado === "cerrado" ? "bg-green-50 text-green-700" :
                    p.estado === "asignado" ? "bg-blue-50 text-blue-700" :
                    p.estado === "perdido" ? "bg-red-50 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {p.estado}
                  </span>
                </div>

                {p.estado !== "cerrado" && (
                  <div className="flex gap-2 mt-2">
                    <select
                      defaultValue=""
                      onChange={e => { if (e.target.value) asignarManual(p.id, e.target.value) }}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs flex-1"
                      disabled={asignando === p.id}
                    >
                      <option value="">Asignar a aliado...</option>
                      {aliados.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
