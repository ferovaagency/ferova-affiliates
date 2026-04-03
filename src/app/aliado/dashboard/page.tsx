export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCOP, whatsappLink } from '@/lib/utils'

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const linkCompleto = `${appUrl}/ref/${aliado.link_referido}`

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
        <p className="text-sm text-blue-600 font-mono truncate mb-2">{linkCompleto}</p>
        <p className="text-xs text-gray-400">
          Compártelo — si alguien paga por aquí la comisión es tuya automáticamente
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Prospecto asignado
        </p>
        {asignacionActiva?.prospectos ? (
          <ProspectoCard
            asignacion={asignacionActiva}
            prospecto={asignacionActiva.prospectos as any}
          />
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
            Últimas comisiones
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

function ProspectoCard({ asignacion, prospecto }: { asignacion: any; prospecto: any }) {
  const waLink = whatsappLink(
    prospecto.telefono,
    `Hola ${prospecto.nombre}, te contacto de Ferova Agency. Nos interesa ayudarte con tu presencia digital. ¿Tienes un momento?`
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
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
          
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium"
          >
            Contactar por WhatsApp
          </a>
          <button
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium"
          >
            Registrar venta cerrada
          </button>
          <NoCerradoButton asignacionId={asignacion.id} />
        </div>
      </div>
    </div>
  )
}

function NoCerradoButton({ asignacionId }: { asignacionId: string }) {
  async function handleClick() {
    if (!confirm('¿Confirmas que no pudiste cerrar este prospecto? Se asignará a otro aliado.')) return
    await fetch('/api/prospectos/reasignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asignacion_id: asignacionId }),
    })
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
    >
      No pude cerrar este prospecto
    </button>
  )
}