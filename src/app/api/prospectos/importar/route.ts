import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { prospectos } = body

  let creados = 0
  let actualizados = 0
  let errores = 0

  for (const p of prospectos) {
    const telefono = String(p.telefono ?? "").replace(/\D/g, "")
    if (!telefono) { errores++; continue }

    const notas = [
      p.sitio_web ? "Web: " + p.sitio_web : null,
      p.linkedin ? "LinkedIn: " + p.linkedin : null,
    ].filter(Boolean).join(" | ")

    const { data: existente } = await adminClient
      .from("prospectos")
      .select("id, estado")
      .eq("telefono", telefono)
      .maybeSingle()

    if (existente) {
      await adminClient
        .from("prospectos")
        .update({
          nombre: p.nombre,
          empresa: p.empresa ?? null,
          email: p.correo ?? null,
          notas: notas || null,
        })
        .eq("id", existente.id)
      actualizados++
    } else {
      const { data: nuevo, error } = await adminClient
        .from("prospectos")
        .insert({
          nombre: p.nombre,
          empresa: p.empresa ?? null,
          email: p.correo ?? null,
          telefono,
          notas: notas || null,
          origen: "ferova",
        })
        .select()
        .single()

      if (error) { errores++; continue }

      await adminClient.rpc("asignar_prospecto", { p_prospecto_id: nuevo.id })
      creados++
    }
  }

  return NextResponse.json({ creados, actualizados, errores })
}
