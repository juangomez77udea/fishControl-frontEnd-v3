import { supplyApi as api } from "../api/supplyApi"
import type { Insumo, DraftInsumo, Presentacion, Stage, InsumoType } from "../types/insumo"

// El tipo de la respuesta del backend
type SupplyResponse = {
  id: number
  suppliesName: string
  presentation: string
  suppliesQuantity: number
  suppliesPrice: number
  suppliesDate: string
  type: string
  stage?: string
  totalWeightKg: number | null
}

// El tipo que se envía al backend para crear/actualizar
type SupplyPayload = Omit<SupplyResponse, 'id' | 'totalWeightKg'>;

// Función para convertir la respuesta del backend al formato del frontend
const mapSupplyToInsumo = (supply: SupplyResponse): Insumo => {
  const validPresentacion = (presentation: string): Presentacion => {
    const validPresentaciones: Presentacion[] = [
      "40kg", "20kg", "Kilogramos", "Gramo", "Litro", "Mililitro", "Unidad", "Caja", "Paquete",
    ]
    return validPresentaciones.includes(presentation as Presentacion) ? (presentation as Presentacion) : "Unidad"
  }

  const validTypes: InsumoType[] = ["FOOD", "MEDICINE", "EQUIPMENT", "PACKAGING", "DISINFECTANT", "OTHER"]
  const tipoInsumo = validTypes.includes(supply.type as InsumoType) ? (supply.type as InsumoType) : "OTHER"

  const cantidad = typeof supply.suppliesQuantity === "number" ? supply.suppliesQuantity : 0
  const valor = typeof supply.suppliesPrice === "number" ? supply.suppliesPrice : 0
  const totalWeightKg = typeof supply.totalWeightKg === 'number' ? supply.totalWeightKg : 0;
  const fechaIngreso = supply.suppliesDate ? new Date(supply.suppliesDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]

  return {
    id: supply.id.toString(),
    nombre: supply.suppliesName,
    presentacion: validPresentacion(supply.presentation),
    cantidad: cantidad,
    valor: valor,
    fechaIngreso: fechaIngreso,
    type: tipoInsumo,
    stage: supply.stage as Stage | undefined, 
    totalWeightKg: totalWeightKg,
  }
}

// Función para convertir datos del frontend al formato que espera el backend para CREAR/ACTUALIZAR
const mapInsumoToSupplyPayload = (insumo: DraftInsumo): SupplyPayload => {
  const cantidad = typeof insumo.cantidad === "string" ? Number.parseFloat(insumo.cantidad) : insumo.cantidad
  const valor = typeof insumo.valor === "string" ? Number.parseFloat(insumo.valor) : insumo.valor
  const fechaFormateada = insumo.fechaIngreso ? new Date(insumo.fechaIngreso).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]

  return {
    suppliesName: insumo.nombre,
    presentation: insumo.presentacion,
    suppliesQuantity: cantidad,
    suppliesPrice: valor,
    suppliesDate: fechaFormateada,
    type: insumo.type,
    stage: insumo.stage,
  }
}

export const insumoService = {
  async getAll(): Promise<Insumo[]> {
    try {
      const response = await api.get<SupplyResponse[]>("/supplies")
      return response.data.map(mapSupplyToInsumo)
    } catch (error) {
      console.error("Error al obtener insumos:", error)
      throw error
    }
  },

  async getById(id: string): Promise<Insumo> {
    try {
      const response = await api.get<SupplyResponse>(`/supplies/${id}`)
      return mapSupplyToInsumo(response.data)
    } catch (error) {
      console.error(`Error al obtener insumo con ID ${id}:`, error)
      throw error
    }
  },

  async searchByName(name: string): Promise<Insumo[]> {
    try {
      const response = await api.get<SupplyResponse[]>(`/supplies/name/${encodeURIComponent(name)}`)
      return response.data.map(mapSupplyToInsumo)
    } catch (error) {
      console.error(`Error al buscar insumos con nombre "${name}":`, error)
      throw error
    }
  },

  async create(insumo: DraftInsumo): Promise<Insumo> {
    try {
      const supplyData = mapInsumoToSupplyPayload(insumo)
      const response = await api.post<SupplyResponse>("/supplies", supplyData)
      return mapSupplyToInsumo(response.data)
    } catch (error) {
      console.error("Error al crear insumo:", error)
      throw error
    }
  },

  async update(id: string, insumo: DraftInsumo): Promise<Insumo> {
    try {
      const supplyData = mapInsumoToSupplyPayload(insumo)
      const response = await api.put<SupplyResponse>(`/supplies/${id}`, supplyData)
      return mapSupplyToInsumo(response.data)
    } catch (error) {
      console.error(`Error al actualizar insumo con ID ${id}:`, error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/supplies/${id}`)
    } catch (error) {
      console.error(`Error al eliminar insumo con ID ${id}:`, error)
      throw error
    }
  },
  
  // ---> INICIO DE LA ADICIÓN <---
  async reduceStock(supplyId: number, amountKg: number): Promise<Insumo> {
    try {
      // Usamos api (supplyApi) para llamar al endpoint PATCH
      const response = await api.patch<SupplyResponse>(`/supplies/${supplyId}/reduce-stock?amountKg=${amountKg}`);
      // Mapeamos la respuesta del backend al formato de Insumo del frontend
      return mapSupplyToInsumo(response.data);
    } catch (error) {
      console.error("Error al reducir el stock:", error);
      throw error;
    }
  }
  // ---> FIN DE LA ADICIÓN <---
}