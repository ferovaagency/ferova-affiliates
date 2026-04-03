export const dynamic = "force-dynamic"

import { adminClient } from "@/lib/supabase/admin"
import { formatCOP } from "@/lib/utils"

export default async function AdminComisiones() {
  const { data: comisiones } = await adminClient
    .from("comisiones")
    .select("*, aliados(nombre, email, metodo_pago), ventas(descripcion_servicio, cliente_nombre, monto)")
    .order("fecha_generacion", { ascending: false })

  const pendientes = (comisiones as any[] ?? []).filter((c: any) => c.estado === "pendiente")
  const totalPendiente = pendientes.reduce((s: number, c: any) => s + c.monto_comision, 0)

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Comisiones</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <p className="text-xs text-amber-600">Total por pagar</p>
          <p className="text-lg font-semibold text-amber-700">{formatCOP(totalPendiente)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {(comisiones as any[] ?? []).map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.aliados?.nombre}</p>
                <p className="text-xs text-gray-500">{c.ventas?.cliente_nombre} · {c.ventas?.descripcion_servicio}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCOP(c.monto_comision)}</p>
                <p className="text-xs text-gray-400">{c.porcentaje}% de {formatCOP(c.monto_venta)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={"text-xs px-2 py-1 rounded-full " + (c.estado === "pagada" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                {c.estado === "pagada" ? "Pagada" : "Pendiente"}
              </span>
              {c.estado === "pendiente" && (
                <PagarButton comisionId={c.id} aliado={c.aliados?.nombre} monto={c.monto_comision} />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

function PagarButton({ comisionId, aliado, monto }: { comisionId: string, aliado: string, monto: number }) {
  return (
    <form action={async () => {
      "use server"
      const { adminClient } = await import("@/lib/supabase/admin")
      await adminClient.from("comisiones").update({ estado: "pagada", fecha_pago: new Date().toISOString(), metodo_pago_usado: "manual" }).eq("id", comisionId)
    }}>
      <button type="submit" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">
        Marcar pagada
      </button>
    </form>
  )
}
