import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AliadorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Ferova Affiliates</span>
        <div className="flex items-center gap-4">
          <a href="/aliado/dashboard" className="text-sm text-gray-600">Inicio</a>
          <a href="/aliado/prospectos" className="text-sm text-gray-600">Prospectos</a>
          <a href="/aliado/comisiones" className="text-sm text-gray-600">Comisiones</a>
          <a href="/aliado/perfil" className="text-sm text-gray-600">Perfil</a>
        </div>
      </nav>
      {children}
    </div>
  )
}
