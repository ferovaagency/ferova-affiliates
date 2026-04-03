import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Ferova Admin</span>
        <div className="flex items-center gap-4">
          <a href="/admin/dashboard" className="text-sm text-gray-600">Dashboard</a>
          <a href="/admin/prospectos" className="text-sm text-gray-600">Prospectos</a>
          <a href="/admin/aliados" className="text-sm text-gray-600">Aliados</a>
          <a href="/admin/ventas" className="text-sm text-gray-600">Ventas</a>
          <a href="/admin/comisiones" className="text-sm text-gray-600">Comisiones</a>
        </div>
      </nav>
      {children}
    </div>
  )
}