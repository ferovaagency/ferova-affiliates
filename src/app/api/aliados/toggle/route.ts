import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { aliado_id, activo } = await req.json()
  await adminClient.from("aliados").update({ activo }).eq("id", aliado_id)
  return NextResponse.json({ ok: true })
}
