import { NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function GET() {
  const { data: aliados } = await adminClient
    .from("aliados")
    .select("*, asignaciones(resultado)")
    .eq("activo", true)
    .order("nombre")

  const aliadosConConteo = (aliados ?? []).map((a: any) => ({
    ...a,
    prospectos_activos: a.asignaciones?.filter((as: any) => as.resultado === "activo").length ?? 0,
  }))

  return NextResponse.json({ aliados: aliadosConConteo })
}
