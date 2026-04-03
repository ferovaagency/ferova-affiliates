import { NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function GET() {
  const { data: servicios } = await adminClient
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("nombre")
  return NextResponse.json({ servicios })
}
