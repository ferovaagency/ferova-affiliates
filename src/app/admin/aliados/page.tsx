"use client"
import { useEffect, useState } from "react"
import { formatCOP } from "@/lib/utils"

export default function AdminAliados() {
  const [aliados, setAliados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aliadoDetalle, setAliadoDetalle] = useState<any>(null)
  const [detalle, setDetalle] = useState<any>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => { cargarAliados() }, [])

  async function cargarAliados() {
    setLoading(true)
    const res = await fetch("/api/aliados/listar")
    const data = await res.json()
    setAliados(data.aliados ?? [])
    setLoading(false)
  }

  async function verDetalle(aliado: any) {
    setAliadoDetalle(aliado)
    setLoadingDetalle(true)
    const res = await fetch("/api/aliados/detalle?id=" + aliado.id)
    const data = await res.json()
    setDetalle(data)
    setLoadingDetalle(false)
  }

  async function toggleActivo(aliadoId: string, activo: boolean) {
    await fetch("/api/aliados/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aliado_id: aliadoId, activo: !activo }),
    })
    await cargarAliados()
  }

  if (loading) return <main className="p-6"><p className="text-sm text-gray-400">Cargando...</p></main>

  if (aliadoDetalle && detalle) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setAliadoDetalle(null); setDetalle(null) }} className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg">
            Volver
          </button>
          <h1 className="text-xl font-medium text-gray-900">{aliadoDetalle.nombre}</h1>
        </div>

        {loadingDetalle ? <p className="text-sm text-gray-400">Cargando detalle...</p> : (
          <div className="space-y-4">
            {/* Metricas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Prospectos activos</p>
                <p className="text-2xl font-semibold text-gray-900">{detalle.prospectos_activos}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Ventas cerradas</p>
                <p className="text-2xl font-semibold text-gray-900">{detalle.ventas_cerradas}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">Comision pendiente</p>
                <p className="text-xl font-semibold text-amber-700">{formatCOP(detalle.comision_pendiente)}</p>
              </div>
            </div>

            {/* Datos de pago */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Datos de pago</p>
              {aliadoDetalle.metodo_pago?.tipo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Metodo</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{aliadoDetalle.metodo_pago.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Dato</span>
                    <span className="text-sm text-gray-900">{aliadoDetalle.metodo_pago.dato}</span>
                  </div>
                  {aliadoDetalle.metodo_pago.banco && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Banco</span>
                      <span className="text-sm text-gray-900">{aliadoDetalle.metodo_pago.banco}</span>
                    </div>
                  )}
                  {aliadoDetalle.metodo_pago.cedula && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cedula</span>
                      <span className="text-sm text-gray-900">{aliadoDetalle.metodo_pago.cedula}</span>
                    </div>
                  )}
                  {aliadoDetalle.metodo_pago.titular && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Titular</span>
                      <span className="text-sm text-gray-900">{aliadoDetalle.metodo_pago.titular}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">El aliado no ha configurado su metodo de pago</p>
              )}
            </div>

            {/* Comisiones */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide p-4 border-b border-gray-100">Historial de comisiones</p>
              {detalle.comisiones?.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {detalle.comisiones.map((c: any) => (
                    <div key={c.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.ventas?.cliente_nombre ?? "Cliente"}</p>
                        <p className="text-xs text-gray-500">{c.ventas?.descripcion_servicio ?? "Servicio"}</p>
                        <p className="text-xs text-gray-400">{new Date(c.fecha_generacion).toLocaleDateString("es-CO")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCOP(c.monto_comision)}</p>
                        <span className={"text-xs px-2 py-0.5 rounded-full " + (c.estado === "pagada" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                          {c.estado === "pagada" ? "Pagada" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 p-4">Sin comisiones todavia</p>
              )}
            </div>

            {/* Ventas */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide p-4 border-b border-gray-100">Historial de ventas</p>
              {detalle.ventas?.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {detalle.ventas.map((v: any) => (
                    <div key={v.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.cliente_nombre}</p>
                        <p className="text-xs text-gray-500">{v.descripcion_servicio ?? v.servicios?.nombre}</p>
                        <p className="text-xs text-gray-400">{new Date(v.fecha_creacion).toLocaleDateString("es-CO")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCOP(v.monto)}</p>
                        <span className={"text-xs px-2 py-0.5 rounded-full " + (v.estado === "pagado" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                          {v.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 p-4">Sin ventas todavia</p>
              )}
            </div>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Aliados</h1>
        <a href="/admin/aliados/nuevo" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl">+ Nuevo aliado</a>
      </div>
      <div className="space-y-3">
        {aliados.map((a: any) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{a.nombre}</p>
                <p className="text-xs text-gray-500">{a.email} · {a.telefono}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={"text-xs px-2 py-1 rounded-full " + (a.activo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                  {a.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-xs text-gray-500">Prospectos activos</p>
                <p className="text-lg font-semibold text-gray-900">{a.prospectos_activos}</p>
              </div>
              <button onClick={() => verDetalle(a)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm">
                Ver detalle
              </button>
              <button onClick={() => toggleActivo(a.id, a.activo)} className={"flex-1 py-2 rounded-xl text-sm " + (a.activo ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                {a.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
