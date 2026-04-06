import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { aliado_id, cantidad } = await req.json()

  const { data: aliado } = await adminClient
    .from("aliados").select("id, nombre, cargado_por:id").eq("id", aliado_id).single()

  const { count: activos } = await adminClient
    .from("asignaciones")
    .select("*", { count: "exact", head: true })
    .eq("aliado_id", aliado_id)
    .eq("resultado", "activo")

  const necesita = (cantidad ?? 10) - (activos ?? 0)
  if (necesita <= 0) return NextResponse.json({ ok: true, mensaje: "Ya tiene suficientes prospectos" })

  const { data: disponibles } = await adminClient
    .from("prospectos")
    .select("id")
    .eq("estado", "sin_asignar")
    .neq("cargado_por", aliado_id)
    .limit(necesita)

  if (!disponibles || disponibles.length === 0) {
    return NextResponse.json({ ok: false, mensaje: "No hay prospectos sin asignar disponibles" })
  }

  for (const p of disponibles) {
    await adminClient.from("asignaciones").insert({ prospecto_id: p.id, aliado_id })
    await adminClient.from("prospectos").update({ estado: "asignado" }).eq("id", p.id)
  }

  return NextResponse.json({ ok: true, asignados: disponibles.length })
}
