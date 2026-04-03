export const dynamic = "force-dynamic"

import { adminClient } from "@/lib/supabase/admin"
import { formatCOP } from "@/lib/utils"

export default async function AdminVentas() {
  const { data: ventas } = await adminClient
    .from("ventas")
    .select("*, aliados(nombre), servicios(nombre)")
    .order("fecha_creacion", { ascending: false })

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Ventas</h1>
      <div className="space-y-3">
        {(ventas as any[] ?? []).map((v: any) => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{v.cliente_nombre}</p>
                <p className="text-xs text-gray-500">{v.aliados?.nombre} · {v.descripcion_servicio ?? v.servicios?.nombre}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCOP(v.monto)}</p>
                <span className={"text-xs px-2 py-1 rounded-full " + (v.estado === "pagado" ? "bg-green-50 text-green-700" : v.estado === "cancelado" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>
                  {v.estado === "pagado" ? "Pagado" : v.estado === "cancelado" ? "Cancelado" : "Pendiente pago"}
                </span>
              </div>
            </div>
            {v.estado === "pendiente_pago" && (
              <GenerarPagoButton ventaId={v.id} cliente={v.cliente_nombre} monto={v.monto} />
            )}
            {v.mp_preference_id && v.estado === "pendiente_pago" && (
              <a href={"https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=" + v.mp_preference_id} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-xs mt-2">
                Ver link de pago generado
              </a>
            )}
          </div>
        ))}
        {(!ventas || ventas.length === 0) && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-sm text-gray-400">No hay ventas todavia</p>
          </div>
        )}
      </div>
    </main>
  )
}

function GenerarPagoButton({ ventaId, cliente, monto }: { ventaId: string, cliente: string, monto: number }) {
  async function generar() {
    "use server"
    const { adminClient } = await import("@/lib/supabase/admin")
    const { MercadoPagoConfig, Preference } = await import("mercadopago")
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const { data: venta } = await adminClient.from("ventas").select("*").eq("id", ventaId).single()
    if (!venta) return
    const preference = await new Preference(mp).create({
      body: {
        items: [{ id: ventaId, title: (venta as any).descripcion_servicio ?? "Servicio Ferova Agency", quantity: 1, unit_price: (venta as any).monto, currency_id: "COP" }],
        payer: { name: (venta as any).cliente_nombre ?? "", email: (venta as any).cliente_email ?? "" },
        metadata: { venta_id: ventaId },
        back_urls: { success: process.env.NEXT_PUBLIC_APP_URL + "/pago/exitoso", failure: process.env.NEXT_PUBLIC_APP_URL + "/pago/error", pending: process.env.NEXT_PUBLIC_APP_URL + "/pago/pendiente" },
        notification_url: process.env.NEXT_PUBLIC_APP_URL + "/api/webhooks/mercadopago",
        auto_return: "approved",
      }
    })
    await adminClient.from("ventas").update({ mp_preference_id: preference.id }).eq("id", ventaId)
  }

  return (
    <form action={generar}>
      <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium">
        Generar link de pago para {cliente}
      </button>
    </form>
  )
}
