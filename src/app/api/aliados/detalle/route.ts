import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

  const [
    { count: prospectos_activos },
    { count: ventas_cerradas },
    { data: comisiones },
    { data: ventas },
  ] = await Promise.all([
    adminClient.from("asignaciones").select("*", { count: "exact", head: true }).eq("aliado_id", id).eq("resultado", "activo"),
    adminClient.from("ventas").select("*", { count: "exact", head: true }).eq("aliado_id", id).eq("estado", "pagado"),
    adminClient.from("comisiones").select("*, ventas(cliente_nombre, descripcion_servicio)").eq("aliado_id", id).order("fecha_generacion", { ascending: false }),
    adminClient.from("ventas").select("*, servicios(nombre)").eq("aliado_id", id).order("fecha_creacion", { ascending: false }),
  ])

  const comision_pendiente = (comisiones ?? []).filter((c: any) => c.estado === "pendiente").reduce((s: number, c: any) => s + c.monto_comision, 0)

  return NextResponse.json({ prospectos_activos, ventas_cerradas, comision_pendiente, comisiones, ventas })
}
