import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { venta_id } = await req.json()

  const { data: venta, error } = await adminClient
    .from('ventas')
    .select('*, aliados(nombre, email), servicios(nombre)')
    .eq('id', venta_id)
    .single()

  if (error || !venta) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
  }

  const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

  const preference = await new Preference(mp).create({
    body: {
      items: [{
        id: venta.id,
        title: venta.descripcion_servicio ?? 'Servicio Ferova Agency',
        quantity: 1,
        unit_price: venta.monto,
        currency_id: 'COP',
      }],
      payer: {
        name: venta.cliente_nombre ?? '',
        email: venta.cliente_email ?? '',
      },
      metadata: { venta_id: venta.id },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pago/exitoso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pago/error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago/pendiente`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      auto_return: 'approved',
    }
  })

  await adminClient
    .from('ventas')
    .update({ mp_preference_id: preference.id })
    .eq('id', venta_id)

  return NextResponse.json({
    preference_id: preference.id,
    checkout_url: preference.init_point,
  })
}