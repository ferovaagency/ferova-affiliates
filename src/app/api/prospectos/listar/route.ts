import { NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function GET() {
  const { data: prospectos } = await adminClient
    .from("prospectos")
    .select("*, asignaciones(aliado_id, resultado)")
    .order("fecha_creacion", { ascending: false })
  return NextResponse.json({ prospectos })
}
