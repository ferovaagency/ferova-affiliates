import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { prospecto_id, aliado_id } = await req.json()

  // Cerrar asignacion activa anterior si existe
  await adminClient
    .from("asignaciones")
    .update({ resultado: "no_cerrado", fecha_resultado: new Date().toISOString() })
    .eq("prospecto_id", prospecto_id)
    .eq("resultado", "activo")

  // Crear nueva asignacion
  await adminClient
    .from("asignaciones")
    .insert({ prospecto_id, aliado_id })

  await adminClient
    .from("prospectos")
    .update({ estado: "asignado" })
    .eq("id", prospecto_id)

  return NextResponse.json({ ok: true })
}
