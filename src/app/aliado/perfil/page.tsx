"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AliadorPerfil() {
  const [aliado, setAliado] = useState<any>(null)
  const [metodo, setMetodo] = useState({ tipo: "paypal", dato: "", banco: "", cedula: "", titular: "" })
  const [loading, setLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from("aliados").select("*").eq("user_id", user.id).single().then(({ data }) => {
        setAliado(data)
        if (data?.metodo_pago?.tipo) setMetodo({ tipo: "paypal", dato: "", banco: "", cedula: "", titular: "", ...data.metodo_pago })
      })
    })
  }, [])

  async function guardar(e: any) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from("aliados").update({ metodo_pago: metodo }).eq("id", aliado.id)
    setGuardado(true)
    setLoading(false)
    setTimeout(() => setGuardado(false), 3000)
  }

  if (!aliado) return <div className="p-4 text-center text-sm text-gray-400">Cargando...</div>

  return (
    <main className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Mi perfil</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Mis datos</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Nombre</span>
            <span className="text-sm font-medium text-gray-900">{aliado.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{aliado.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Link referido</span>
            <span className="text-sm text-blue-600 font-mono">{aliado.link_referido}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Datos de pago para comisiones</p>
        <form onSubmit={guardar} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Metodo de pago</label>
            <select value={metodo.tipo} onChange={e => setMetodo({...metodo, tipo: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
              <option value="paypal">PayPal</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="transferencia">Transferencia bancaria</option>
            </select>
          </div>

          {metodo.tipo === "transferencia" ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Banco</label>
                <input value={metodo.banco} onChange={e => setMetodo({...metodo, banco: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre del banco" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Numero de cuenta</label>
                <input value={metodo.dato} onChange={e => setMetodo({...metodo, dato: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Numero de cuenta" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Titular de la cuenta</label>
                <input value={metodo.titular} onChange={e => setMetodo({...metodo, titular: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo del titular" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cedula del titular</label>
                <input value={metodo.cedula} onChange={e => setMetodo({...metodo, cedula: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Numero de cedula" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {metodo.tipo === "paypal" ? "Email de PayPal" : "Numero de celular"}
                </label>
                <input value={metodo.dato} onChange={e => setMetodo({...metodo, dato: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder={metodo.tipo === "paypal" ? "tu@paypal.com" : "3001234567"} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cedula</label>
                <input value={metodo.cedula} onChange={e => setMetodo({...metodo, cedula: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Numero de cedula" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
                <input value={metodo.titular} onChange={e => setMetodo({...metodo, titular: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo para pagos" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
            {guardado ? "Guardado!" : loading ? "Guardando..." : "Guardar datos de pago"}
          </button>
        </form>
      </div>
    </main>
  )
}
