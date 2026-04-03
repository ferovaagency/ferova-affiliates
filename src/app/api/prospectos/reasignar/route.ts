import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { asignacion_id, notas } = await req.json()

  const { data, error } = await adminClient
    .rpc('reasignar_prospecto', {
      p_asignacion_id: asignacion_id,
      p_notas: notas ?? null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}