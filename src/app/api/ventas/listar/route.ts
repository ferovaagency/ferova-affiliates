import { NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function GET() {
  const { data: ventas } = await adminClient
    .from("ventas")
    .select("*, aliados(nombre), servicios(nombre)")
    .order("fecha_creacion", { ascending: false })
  return NextResponse.json({ ventas })
}
