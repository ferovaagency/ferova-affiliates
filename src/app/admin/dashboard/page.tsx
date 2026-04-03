export const dynamic = "force-dynamic"

import { adminClient } from "@/lib/supabase/admin"
import { formatCOP } from "@/lib/utils"

export default async function AdminDashboard() {
  const [
    { count: totalAliados },
    { count: prospectosSinAsignar },
    { data: comisionesPendientes },
    { data: ventasRecientes },
  ] = await Promise.all([
    adminClient.from("aliados").select("*", { count: "exact", head: true }).eq("activo", true),
    adminClient.from("prospectos").select("*", { count: "exact", head: true }).eq("estado", "sin_asignar"),
    adminClient.from("comisiones").select("monto_comision").eq("estado", "pendiente"),
    adminClient.from("ventas").select("*, aliados(nombre), servicios(nombre)").order("fecha_creacion", { ascending: false }).limit(10),
  ])

  const totalPendiente = (comisionesPendientes as any[])?.reduce((s: number, c: any) => s + c.monto_comision, 0) ?? 0

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ferova Affiliates</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/prospectos" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl">+ Prospecto</a>
          <a href="/admin/aliados" className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl">+ Aliado</a>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Aliados activos</p>
          <p className="text-2xl font-semibold text-gray-900">{totalAliados ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Sin asignar</p>
          <p className="text-2xl font-semibold text-gray-900">{prospectosSinAsignar ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Comisiones por pagar</p>
          <p className="text-xl font-semibold text-gray-900">{formatCOP(totalPendiente)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Ventas totales</p>
          <p className="text-2xl font-semibold text-gray-900">{ventasRecientes?.length ?? 0}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-medium text-gray-900">Ventas recientes</p>
          <a href="/admin/ventas" className="text-sm text-blue-600">Ver todas</a>
        </div>
        {ventasRecientes && ventasRecientes.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {ventasRecientes.map((v: any) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.cliente_nombre ?? "Cliente"}</p>
                  <p className="text-xs text-gray-500">{v.aliados?.nombre} - {v.descripcion_servicio ?? v.servicios?.nombre ?? "Servicio"}</p>
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
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No hay ventas todavia</p>
          </div>
        )}
      </div>
    </main>
  )
}
