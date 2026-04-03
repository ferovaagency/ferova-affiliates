import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { generarLinkReferido } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { nombre, email, telefono } = await req.json()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: `Ferova${Math.random().toString(36).slice(-10)}!`,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { data: aliado, error } = await adminClient
    .from('aliados')
    .insert({
      user_id: authData.user.id,
      nombre,
      email,
      telefono,
      link_referido: generarLinkReferido(nombre),
      metodo_pago: {},
      activo: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await adminClient.auth.admin.generateLink({ type: 'magiclink', email })

  return NextResponse.json({ aliado })
}