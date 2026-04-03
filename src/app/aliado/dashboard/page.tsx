export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatCOP } from "@/lib/utils"

export default async function AliadorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: aliado } = await supabase
    .from("aliados").select("*").eq("user_id", user.id).single()
  if (!aliado) redirect("/login")

  const { data: asignacionActiva } = await supabase
    .from("asignaciones")
    .select("*, prospectos(*)")
    .eq("aliado_id", aliado.id)
    .eq("resultado", "activo")
    .order("fecha_asignacion", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: comisiones } = await supabase
    .from("comisiones")
    .select("*, ventas(descripcion_servicio, cliente_nombre)")
    .eq("aliado_id", aliado.id)
    .order("fecha_generacion", { ascending: false })
    .limit(20)

  const pendiente = comisiones
    ?.filter(c => c.estado === "pendiente")
    .reduce((s, c) => s + c.monto_comision, 0) ?? 0

  const totalGanado = comisiones
    ?.reduce((s, c) => s + c.monto_comision, 0) ?? 0

  const prospecto = asignacionActiva?.prospectos as any
  const telefono = prospecto?.telefono ?? ""
  const waUrl = "https://wa.me/57" + telefono.replace(/\D/g, "")

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Hola {aliado.nombre}</h1>
        <p className="text-sm text-gray-500 mt-1">Panel de aliado Ferova</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Por cobrar</p>
          <p className="text-lg font-semibold text-gray-900">{formatCOP(pendiente)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total ganado</p>
          <p className="text-lg font-semibold text-gray-900">{formatCOP(totalGanado)}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
        <p className="text-xs text-gray-500 mb-2">Tu link de referido</p>
        <p className="text-sm text-blue-600 font-mono truncate">{aliado.link_referido}</p>
      </div>
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Prospecto asignado</p>
        {prospecto ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-900 mb-1">{prospecto.nombre}</p>
            {prospecto.empresa && <p className="text-sm text-gray-500 mb-3">{prospecto.empresa}</p>}
            <div className="space-y-2">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium">Contactar WhatsApp</a>
              <a href={"/aliado/registrar-cierre?asignacion=" + asignacionActiva.id} className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium">Registrar venta cerrada</a>
              <a href={"/aliado/no-cerrado?asignacion=" + asignacionActiva.id} className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">No pude cerrar</a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">No tienes prospectos asignados</p>
          </div>
        )}
      </div>
    </main>
  )
}
