export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatCOP } from "@/lib/utils"

export default async function AliadorComisiones() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: aliadoData } = await supabase.from("aliados").select("*").eq("user_id", user.id).single()
  const aliado = aliadoData as any
  if (!aliado) redirect("/login")

  const { data: comisionesData } = await supabase
    .from("comisiones")
    .select("*, ventas(descripcion_servicio, cliente_nombre, monto, fecha_pago)")
    .eq("aliado_id", aliado.id)
    .order("fecha_generacion", { ascending: false })

  const comisiones = (comisionesData ?? []) as any[]
  const pendiente = comisiones.filter(c => c.estado === "pendiente").reduce((s, c) => s + c.monto_comision, 0)
  const pagado = comisiones.filter(c => c.estado === "pagada").reduce((s, c) => s + c.monto_comision, 0)

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Mis comisiones</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 mb-1">Por cobrar</p>
          <p className="text-lg font-semibold text-amber-700">{formatCOP(pendiente)}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs text-green-600 mb-1">Total cobrado</p>
          <p className="text-lg font-semibold text-green-700">{formatCOP(pagado)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {comisiones.length > 0 ? comisiones.map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.ventas?.cliente_nombre ?? "Cliente"}</p>
                <p className="text-xs text-gray-500">{c.ventas?.descripcion_servicio ?? "Servicio Ferova"}</p>
                <p className="text-xs text-gray-400 mt-1">Venta: {formatCOP(c.monto_venta)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCOP(c.monto_comision)}</p>
                <span className={"text-xs px-2 py-0.5 rounded-full mt-1 inline-block " + (c.estado === "pagada" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                  {c.estado === "pagada" ? "Pagada" : "Pendiente"}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">No tienes comisiones todavia</p>
            <p className="text-xs text-gray-400 mt-1">Cuando cierres una venta aparecera aqui</p>
          </div>
        )}
      </div>
    </main>
  )
}
