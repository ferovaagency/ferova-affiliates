import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { comision_id, metodo_pago } = await req.json()

  const { data, error } = await adminClient
    .from('comisiones')
    .update({
      estado: 'pagada',
      metodo_pago_usado: metodo_pago,
      fecha_pago: new Date().toISOString(),
    })
    .eq('id', comision_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comision: data })
}