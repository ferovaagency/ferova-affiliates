import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const payment = await new Payment(mp).get({ id: body.data.id })

    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    const venta_id = (payment.metadata as any)?.venta_id as string
    if (!venta_id) return NextResponse.json({ ok: true })

    await adminClient
      .from('ventas')
      .update({ mp_payment_id: String(payment.id) })
      .eq('id', venta_id)

    await adminClient.rpc('generar_comision', { p_venta_id: venta_id })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook MP error:', err)
    return NextResponse.json({ error: 'error' }, { status: 500 })
  }
}