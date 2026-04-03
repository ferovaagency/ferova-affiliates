export type Json = Record<string, unknown>

export type Database = {
  public: {
    Tables: {
      aliados: {
        Row: {
          id: string
          user_id: string
          nombre: string
          email: string
          telefono: string | null
          link_referido: string
          metodo_pago: Json
          activo: boolean
          fecha_registro: string
        }
        Insert: Omit<Database['public']['Tables']['aliados']['Row'], 'id' | 'fecha_registro'>
        Update: Partial<Database['public']['Tables']['aliados']['Insert']>
      }
      servicios: {
        Row: { id: string; nombre: string; descripcion: string | null; precio_base: number | null; activo: boolean }
        Insert: Omit<Database['public']['Tables']['servicios']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['servicios']['Insert']>
      }
      prospectos: {
        Row: {
          id: string; nombre: string; empresa: string | null; email: string | null
          telefono: string; notas: string | null; origen: 'ferova' | 'aliado'
          cargado_por: string | null
          estado: 'sin_asignar' | 'asignado' | 'en_negociacion' | 'cerrado' | 'perdido'
          fecha_creacion: string
        }
        Insert: Omit<Database['public']['Tables']['prospectos']['Row'], 'id' | 'fecha_creacion'>
        Update: Partial<Database['public']['Tables']['prospectos']['Insert']>
      }
      asignaciones: {
        Row: {
          id: string; prospecto_id: string; aliado_id: string
          resultado: 'activo' | 'cerrado' | 'no_cerrado'
          notas_cierre: string | null; fecha_asignacion: string; fecha_resultado: string | null
        }
        Insert: Omit<Database['public']['Tables']['asignaciones']['Row'], 'id' | 'fecha_asignacion'>
        Update: Partial<Database['public']['Tables']['asignaciones']['Insert']>
      }
      ventas: {
        Row: {
          id: string; aliado_id: string; prospecto_id: string | null; servicio_id: string | null
          descripcion_servicio: string | null; monto: number
          estado: 'pendiente_pago' | 'pagado' | 'cancelado'
          origen: 'referido' | 'prospecto'
          mp_preference_id: string | null; mp_payment_id: string | null
          cliente_nombre: string | null; cliente_email: string | null; cliente_telefono: string | null
          fecha_creacion: string; fecha_pago: string | null
        }
        Insert: Omit<Database['public']['Tables']['ventas']['Row'], 'id' | 'fecha_creacion'>
        Update: Partial<Database['public']['Tables']['ventas']['Insert']>
      }
      comisiones: {
        Row: {
          id: string; aliado_id: string; venta_id: string; monto_venta: number
          porcentaje: number; monto_comision: number; estado: 'pendiente' | 'pagada'
          metodo_pago_usado: string | null; fecha_generacion: string; fecha_pago: string | null
        }
        Insert: Omit<Database['public']['Tables']['comisiones']['Row'], 'id' | 'fecha_generacion'>
        Update: Partial<Database['public']['Tables']['comisiones']['Insert']>
      }
    }
    Functions: {
      asignar_prospecto: { Args: { p_prospecto_id: string }; Returns: Json }
      reasignar_prospecto: { Args: { p_asignacion_id: string; p_notas?: string }; Returns: Json }
      generar_comision: { Args: { p_venta_id: string }; Returns: void }
    }
  }
}