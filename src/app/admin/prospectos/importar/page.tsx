"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ImportarProspectos() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [preview, setPreview] = useState<any[]>([])

  function parsearCSV(texto: string) {
    const lineas = texto.trim().split("\n")
    const headers = lineas[0].split(",").map(h => h.trim().toLowerCase()
      .replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u").replace(/á/g, "a")
      .replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""))
    
    return lineas.slice(1).map(linea => {
      const valores = linea.split(",").map(v => v.trim().replace(/^"|"$/g, ""))
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = valores[i] ?? "" })
      return obj
    }).filter(p => p.nombre && p.telefono)
  }

  function handleArchivo(e: any) {
    const archivo = e.target.files[0]
    if (!archivo) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const texto = ev.target?.result as string
      const datos = parsearCSV(texto)
      setPreview(datos)
    }
    reader.readAsText(archivo, "UTF-8")
  }

  async function handleImportar() {
    if (!preview.length) return
    setLoading(true)
    const res = await fetch("/api/prospectos/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectos: preview }),
    })
    const data = await res.json()
    setResultado(data)
    setLoading(false)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/prospectos" className="text-sm text-gray-500">Prospectos</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-medium text-gray-900">Importar CSV</h1>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium mb-1">Formato requerido</p>
        <p className="text-xs text-blue-700">El CSV debe tener estas columnas: <strong>nombre, empresa, telefono, correo, sitio web, linkedin</strong></p>
        <p className="text-xs text-blue-700 mt-1">Duplicados se detectan por telefono. Los existentes se actualizan, los nuevos se crean y asignan automaticamente.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <label className="block text-sm text-gray-700 mb-3 font-medium">Selecciona tu archivo CSV</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleArchivo}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white"
        />
      </div>

      {preview.length > 0 && !resultado && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{preview.length} prospectos detectados</p>
            <button onClick={handleImportar} disabled={loading} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl disabled:opacity-50">
              {loading ? "Importando..." : "Importar todos"}
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {preview.slice(0, 10).map((p, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.empresa} · {p.telefono}</p>
                </div>
                <p className="text-xs text-gray-400">{p.correo}</p>
              </div>
            ))}
            {preview.length > 10 && (
              <div className="p-3 text-center">
                <p className="text-xs text-gray-400">...y {preview.length - 10} mas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {resultado && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-900 mb-4">Importacion completada</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-green-700">{resultado.creados}</p>
              <p className="text-xs text-green-600 mt-1">Creados y asignados</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-blue-700">{resultado.actualizados}</p>
              <p className="text-xs text-blue-600 mt-1">Actualizados</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-red-700">{resultado.errores}</p>
              <p className="text-xs text-red-600 mt-1">Con errores</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setResultado(null); setPreview([]) }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">
              Importar otro archivo
            </button>
            <a href="/admin/prospectos" className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium text-center">
              Ver prospectos
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
