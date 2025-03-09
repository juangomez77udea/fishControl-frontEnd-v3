export type Presentacion = "Kilogramos" | "Gramo" | "Litro" | "Mililitro" | "Unidad" | "Caja" | "Paquete"

export type DraftInsumo = {
  nombre: string
  cantidad: number
  presentacion: Presentacion
  valor: number
  fechaIngreso: string
}

export type Insumo = DraftInsumo & {
  id: string
}

