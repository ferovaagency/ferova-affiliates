import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, empresa, email, telefono, notas, origen, cargado_por } = body

  const { data: prospecto, error } = await adminClient
    .from('prospectos')
    .insert({
      nombre,
      empresa,
      email,
      telefono,
      notas,
      origen: origen ?? 'ferova',
      cargado_por: cargado_por ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: asignacion } = await adminClient
    .rpc('asignar_prospecto', { p_prospecto_id: prospecto.id })

  return NextResponse.json({ prospecto, asignacion })
}