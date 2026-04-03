export const dynamic = "force-dynamic"

import { adminClient } from "@/lib/supabase/admin"

export default async function AdminProspectos() {
  const { data: prospectos } = await adminClient
    .from("prospectos")
    .select("*, asignaciones(resultado, aliados(nombre))")
    .order("fecha_creacion", { ascending: false })

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Prospectos</h1>
        <div className="flex gap-2">
          <a href="/admin/prospectos/importar" className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl">
            Importar CSV
          </a>
          <a href="/admin/prospectos/nuevo" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl">
            + Nuevo
          </a>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{(prospectos as any[])?.length ?? 0} prospectos en total</p>
        </div>
        <div className="divide-y divide-gray-50">
          {(prospectos as any[] ?? []).map((p: any) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                <p className="text-xs text-gray-500">{p.empresa ?? "Sin empresa"} · {p.telefono}</p>
              </div>
              <div className="text-right">
                <span className={"text-xs px-2 py-1 rounded-full " + (
                  p.estado === "cerrado" ? "bg-green-50 text-green-700" :
                  p.estado === "asignado" ? "bg-blue-50 text-blue-700" :
                  p.estado === "perdido" ? "bg-red-50 text-red-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {p.estado}
                </span>
                {p.asignaciones?.[0]?.aliados?.nombre && (
                  <p className="text-xs text-gray-400 mt-1">{p.asignaciones[0].aliados.nombre}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
