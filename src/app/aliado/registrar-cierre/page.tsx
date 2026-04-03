"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function RegistrarCierre() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const asignacionId = searchParams.get("asignacion") ?? ""
  const [loading, setLoading] = useState(false)
  const [servicios, setServicios] = useState<any[]>([])
  const [form, setForm] = useState({
    servicio_id: "",
    descripcion_servicio: "",
    monto: "",
    cliente_nombre: "",
    cliente_email: "",
    cliente_telefono: "",
  })

  useEffect(() => {
    fetch("/api/servicios").then(r => r.json()).then(d => setServicios(d.servicios ?? []))
  }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/ventas/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, asignacion_id: asignacionId, monto: Number(form.monto) }),
    })
    const data = await res.json()
    if (data.error) { alert("Error: " + data.error); setLoading(false); return }
    alert("Venta registrada correctamente.")
    router.push("/aliado/dashboard")
  }

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Registrar venta cerrada</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Servicio vendido *</label>
          <select required value={form.servicio_id} onChange={e => setForm({...form, servicio_id: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
            <option value="">Selecciona un servicio</option>
            {servicios.map((s: any) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
            <option value="otro">Otro servicio</option>
          </select>
        </div>
        {form.servicio_id === "otro" && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Describe el servicio *</label>
            <input required value={form.descripcion_servicio} onChange={e => setForm({...form, descripcion_servicio: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Ej: Pagina web con chatbot" />
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Valor acordado en COP *</label>
          <input required type="number" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="3500000" />
          {form.monto && Number(form.monto) > 0 && (
            <p className="text-xs text-green-600 mt-1">Tu comision: ${Math.round(Number(form.monto) * 0.20).toLocaleString("es-CO")}</p>
          )}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Datos del cliente</p>
          <div className="space-y-3">
            <input required value={form.cliente_nombre} onChange={e => setForm({...form, cliente_nombre: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre del cliente *" />
            <input type="email" value={form.cliente_email} onChange={e => setForm({...form, cliente_email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Email del cliente" />
            <input value={form.cliente_telefono} onChange={e => setForm({...form, cliente_telefono: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Telefono del cliente" />
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs text-amber-700">El admin revisara esta venta y generara el link de pago para el cliente.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "Registrando..." : "Registrar venta"}
        </button>
        <a href="/aliado/dashboard" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">
          Cancelar
        </a>
      </form>
    </main>
  )
}
