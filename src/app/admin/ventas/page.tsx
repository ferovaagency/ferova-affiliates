"use client"
import { useEffect, useState } from "react"
import { formatCOP } from "@/lib/utils"

export default function AdminVentas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ventas/listar").then(r => r.json()).then(d => {
      setVentas(d.ventas ?? [])
      setLoading(false)
    })
  }, [])

  async function generarPago(ventaId: string) {
    const res = await fetch("/api/ventas/generar-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venta_id: ventaId }),
    })
    const data = await res.json()
    if (data.error) { alert("Error: " + data.error); return }
    setVentas(prev => prev.map(v => v.id === ventaId ? { ...v, mp_preference_id: data.preference_id, checkout_url: data.checkout_url } : v))
    alert("Link generado. Ya puedes copiarlo y enviarselo al cliente.")
  }

  async function copiarLink(url: string) {
    await navigator.clipboard.writeText(url)
    alert("Link copiado al portapapeles")
  }

  if (loading) return <main className="p-6"><p className="text-sm text-gray-400">Cargando...</p></main>

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Ventas</h1>
      <div className="space-y-3">
        {ventas.length > 0 ? ventas.map((v: any) => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{v.cliente_nombre}</p>
                <p className="text-xs text-gray-500">{v.aliados?.nombre} · {v.descripcion_servicio ?? v.servicios?.nombre}</p>
                {v.cliente_email && <p className="text-xs text-gray-400 mt-0.5">{v.cliente_email}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCOP(v.monto)}</p>
                <span className={"text-xs px-2 py-1 rounded-full " + (v.estado === "pagado" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                  {v.estado === "pagado" ? "Pagado" : "Pendiente pago"}
                </span>
              </div>
            </div>
            {v.estado === "pendiente_pago" && !v.mp_preference_id && (
              <button onClick={() => generarPago(v.id)} className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium">
                Generar link de pago
              </button>
            )}
            {v.mp_preference_id && (
              <div className="space-y-2">
                <a href={v.checkout_url ?? "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=" + v.mp_preference_id} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium">
                  Abrir link de pago
                </a>
                <button onClick={() => copiarLink(v.checkout_url ?? "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=" + v.mp_preference_id)} className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">
                  Copiar link para enviar al cliente
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-sm text-gray-400">No hay ventas todavia</p>
          </div>
        )}
      </div>
    </main>
  )
}
