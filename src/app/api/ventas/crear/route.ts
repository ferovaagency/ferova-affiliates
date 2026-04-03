import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: aliadoData } = await adminClient
    .from("aliados").select("id").eq("user_id", user.id).single()
  const aliado = aliadoData as any
  if (!aliado) return NextResponse.json({ error: "Aliado no encontrado" }, { status: 404 })

  const body = await req.json()
  const { asignacion_id, servicio_id, descripcion_servicio, monto, cliente_nombre, cliente_email, cliente_telefono } = body

  const { data: asignacionData } = await adminClient
    .from("asignaciones").select("prospecto_id").eq("id", asignacion_id).single()
  const asignacion = asignacionData as any

  const { data: ventaData, error } = await adminClient
    .from("ventas")
    .insert({
      aliado_id: aliado.id,
      prospecto_id: asignacion?.prospecto_id ?? null,
      servicio_id: servicio_id === "otro" ? null : (servicio_id || null),
      descripcion_servicio: servicio_id === "otro" ? descripcion_servicio : null,
      monto: Number(monto),
      origen: "prospecto",
      cliente_nombre,
      cliente_email: cliente_email || null,
      cliente_telefono: cliente_telefono || null,
      estado: "pendiente_pago",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (asignacion_id) {
    await adminClient
      .from("asignaciones")
      .update({ resultado: "cerrado", fecha_resultado: new Date().toISOString() })
      .eq("id", asignacion_id)
  }

  if (asignacion?.prospecto_id) {
    await adminClient
      .from("prospectos")
      .update({ estado: "cerrado" })
      .eq("id", asignacion.prospecto_id)
  }

  return NextResponse.json({ venta: ventaData })
}
