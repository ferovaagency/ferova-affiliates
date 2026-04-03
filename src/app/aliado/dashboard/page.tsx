export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCOP } from '@/lib/utils'

export default async function AliadorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aliado } = await supabase
    .from('aliados').select('*').eq('user_id', user.id).single()
  if (!aliado) redirect('/login')

  const { data: asignacionActiva } = await supabase
    .from('asignaciones')
    .select('*, prospectos(*)')
    .eq('aliado_id', aliado.id)
    .eq('resultado', 'activo')
    .order('fecha_asignacion', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: comisiones } = await supabase
    .from('comisiones')
    .select('*, ventas(descripcion_servicio, cliente_nombre)')
    .eq('aliado_id', aliado.id)
    .order('fecha_generacion', { ascending: false })
    .limit(20)

  const pendiente = comisiones
    ?.filter(c => c.estado === 'pendiente')
    .reduce((s, c) => s + c.monto_comision, 0) ?? 0

  const totalGanado = comisiones
    ?.reduce((s, c) => s + c.monto_comision, 0) ?? 0

  const prospecto = asignacionActiva?.prospectos as any
  const telefono = prospecto?.telefono ?? ''
  const waUrl = 'https://wa.me/57' + telefono.replace(/\D/g, '')

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">
          Hola, {aliado.nombre.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Panel de aliado Ferova</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Por cobrar</p>
          <p className="text-lg font-semibold text-gray-900">{formatCOP(pendiente)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total ganado</p>
          <p className="text-lg font-semibold text-gray-900">{formatCOP(totalGanado)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Tu link de referido
        </p>
        <p className="text-sm text-blue-600 font-mono truncate mb-2">
          {process.env.NEXT_PUBLIC_APP_URL}/ref/{aliado.link_referido}
        </p>
        <p className="text-xs text-gray-400">
          Comparte este link. Si alguien paga por aqui la comision es tuya automaticamente
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Prospecto asignado
        </p>
        {prospecto ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{prospecto.nombre}</p>
                {prospecto.empresa && (
                  <p className="text-sm text-gray-500">{prospecto.empresa}</p>
                )}
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                Activo
              </span>
            </div>
            {prospecto.notas && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-700">{prospecto.notas}</p>
              </div>
            )}
            <div className="space-y-2">
              
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium"
              >
                Contactar por WhatsApp
              </a>
              
                href={'/aliado/registrar-cierre?asignacion=' + asignacionActiva.id}
                className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium"
              >
                Registrar venta cerrada
              </a>
              
                href={'/aliado/no-cerrado?asignacion=' + asignacionActiva.id}
                className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
              >
                No pude cerrar este prospecto
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-400">No tienes prospectos asignados</p>
            <p className="text-xs text-gray-400 mt-1">
              Cuando llegue uno te notificamos por WhatsApp
            </p>
          </div>
        )}
      </div>

      {comisiones && comisiones.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
            Ultimas comisiones
          </p>
          <div className="space-y-2">
            {comisiones.slice(0, 5).map(c => (
              <div key={c.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {(c.ventas as any)?.cliente_nombre ?? 'Cliente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(c.ventas as any)?.descripcion_servicio ?? 'Servicio Ferova'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCOP(c.monto_comision)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.estado === 'pagada'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}