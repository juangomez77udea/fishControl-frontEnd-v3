import { api } from "../api/api"

// Tipo para los datos de lote que vienen del backend
export type BatchResponse = {
  batchId: number
  quantityAnimalsPerBatch: number
  averageWeightPerAnimal: number
  entryDate: string
  batchAge: number
  animalsRemoved: number
}

// Tipo para los datos de lote en el frontend
export type Batch = {
  id: string
  quantityAnimals: number
  averageWeight: number
  entryDate: string
  batchAge: number
  animalsRemoved: number
}

// Función para convertir la respuesta del backend al formato del frontend
const mapBatchResponseToBatch = (batch: BatchResponse): Batch => {
  return {
    id: batch.batchId.toString(),
    quantityAnimals: batch.quantityAnimalsPerBatch,
    averageWeight: batch.averageWeightPerAnimal,
    entryDate: new Date(batch.entryDate).toLocaleDateString(),
    batchAge: batch.batchAge,
    animalsRemoved: batch.animalsRemoved,
  }
}

// Servicio para gestionar los lotes
export const batchService = {
  async getAll(): Promise<Batch[]> {
    try {
      const response = await api.get<BatchResponse[]>("/batches")
      return response.data.map(mapBatchResponseToBatch)
    } catch (error) {
      console.error("Error al obtener lotes:", error)
      throw error
    }
  },

  async getById(id: string): Promise<Batch> {
    try {
      const response = await api.get<BatchResponse>(`/batches/${id}`)
      return mapBatchResponseToBatch(response.data)
    } catch (error) {
      console.error(`Error al obtener lote con ID ${id}:`, error)
      throw error
    }
  },

  // Modificar la función create para manejar correctamente la fecha
  async create(batch: Omit<Batch, "id">): Promise<Batch> {
    try {
      // Convertir al formato que espera el backend
      const batchData = {
        quantityAnimalsPerBatch: batch.quantityAnimals,
        averageWeightPerAnimal: batch.averageWeight,
        // Asegurarse de que la fecha se envíe en formato ISO con hora
        entryDate: new Date(batch.entryDate).toISOString().replace("Z", ""),
        batchAge: batch.batchAge,
        animalsRemoved: 0, // Por defecto, no hay animales removidos al crear
      }

      console.log("Enviando datos al backend:", batchData)
      const response = await api.post<BatchResponse>("/batches", batchData)
      return mapBatchResponseToBatch(response.data)
    } catch (error) {
      console.error("Error al crear lote:", error)
      throw error
    }
  },

  async update(id: string, batch: Partial<Batch>): Promise<Batch> {
    try {
      // Convertir al formato que espera el backend
      const batchData: Partial<BatchResponse> = {}

      if (batch.quantityAnimals !== undefined) {
        batchData.quantityAnimalsPerBatch = batch.quantityAnimals
      }

      if (batch.averageWeight !== undefined) {
        batchData.averageWeightPerAnimal = batch.averageWeight
      }

      if (batch.batchAge !== undefined) {
        batchData.batchAge = batch.batchAge
      }

      const response = await api.put<BatchResponse>(`/batches/${id}`, batchData)
      return mapBatchResponseToBatch(response.data)
    } catch (error) {
      console.error(`Error al actualizar lote con ID ${id}:`, error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/batches/${id}`)
    } catch (error) {
      console.error(`Error al eliminar lote con ID ${id}:`, error)
      throw error
    }
  },

  async removeAnimals(id: string, animalsToRemove: number): Promise<Batch> {
    try {
      const response = await api.patch<BatchResponse>(
        `/batches/${id}/remove-animals?animalsToRemove=${animalsToRemove}`,
      )
      return mapBatchResponseToBatch(response.data)
    } catch (error) {
      console.error(`Error al remover animales del lote con ID ${id}:`, error)
      throw error
    }
  },
}
