// services/batch-service.ts
import { batchApiInstance } from "../api/batchApi"; // Asegúrate de que batchApiInstance esté exportado desde ../api/api
// o si está en el mismo archivo api.ts:
// import { batchApiInstance } from "../api/api";


// Tipos para la respuesta del backend y el modelo del frontend
export type BatchResponse = {
  batchId: number;
  quantityAnimalsPerBatch: number;
  averageWeightPerAnimal: number;
  entryDate: string;
  batchAge: number;
  animalsRemoved: number;
};

export type Batch = {
  id: string;
  quantityAnimals: number;
  averageWeight: number;
  entryDate: string;
  batchAge: number;
  animalsRemoved: number;
};

// Función para convertir la respuesta del backend al formato del frontend
const mapBatchResponseToBatch = (batch: BatchResponse): Batch => {
  return {
    id: batch.batchId.toString(),
    quantityAnimals: batch.quantityAnimalsPerBatch,
    averageWeight: batch.averageWeightPerAnimal,
    // Para mostrar, toLocaleDateString está bien. Para enviar, considera formato ISO YYYY-MM-DD
    entryDate: new Date(batch.entryDate).toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }), // o el formato que prefieras
    batchAge: batch.batchAge,
    animalsRemoved: batch.animalsRemoved,
  }
}

export const batchService = {
  async getAll(): Promise<Batch[]> {
    try {
      // La URL completa será: http://localhost:7777/api/batches
      const response = await batchApiInstance.get<BatchResponse[]>("/batches");
      return response.data.map(mapBatchResponseToBatch);
    } catch (error) {
      console.error("Error al obtener lotes:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Batch> {
    try {
      // URL: http://localhost:7777/api/batches/{id}
      const response = await batchApiInstance.get<BatchResponse>(`/batches/${id}`);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error al obtener lote con ID ${id}:`, error);
      throw error;
    }
  },

  async create(batch: Omit<Batch, "id" | "animalsRemoved"> & { animalsRemoved?: number }): Promise<Batch> {
    try {
      const batchData = {
        quantityAnimalsPerBatch: batch.quantityAnimals,
        averageWeightPerAnimal: batch.averageWeight,
        // Enviar solo la fecha YYYY-MM-DD ya que CreateBatchDTO espera LocalDate
        entryDate: batch.entryDate, // Asumiendo que entryDate en el formulario ya es "YYYY-MM-DD"
        batchAge: batch.batchAge,
        // animalsRemoved no se envía al crear, se inicializa en backend o es 0
      };

      console.log("Enviando datos de lote al backend:", batchData);
      // URL: http://localhost:7777/api/batches
      const response = await batchApiInstance.post<BatchResponse>("/batches", batchData);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error("Error al crear lote:", error);
      throw error;
    }
  },

  async update(id: string, batch: Partial<Omit<Batch, "id" | "entryDate" | "animalsRemoved">>): Promise<Batch> {
    try {
      // Mapea solo los campos que se pueden actualizar según tu backend
      // Tu UpdateBatchRequest en backend solo tiene quantity, averageWeight, batchAge
      const batchDataToUpdate: {
        quantityAnimalsPerBatch?: number;
        averageWeightPerAnimal?: number;
        batchAge?: number;
      } = {};

      if (batch.quantityAnimals !== undefined) {
        batchDataToUpdate.quantityAnimalsPerBatch = batch.quantityAnimals;
      }
      if (batch.averageWeight !== undefined) {
        batchDataToUpdate.averageWeightPerAnimal = batch.averageWeight;
      }
      if (batch.batchAge !== undefined) {
        batchDataToUpdate.batchAge = batch.batchAge;
      }

      // URL: http://localhost:7777/api/batches/{id}
      const response = await batchApiInstance.put<BatchResponse>(`/batches/${id}`, batchDataToUpdate);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error al actualizar lote con ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // URL: http://localhost:7777/api/batches/{id}
      await batchApiInstance.delete(`/batches/${id}`);
    } catch (error) {
      console.error(`Error al eliminar lote con ID ${id}:`, error);
      throw error;
    }
  },

  async removeAnimals(id: string, animalsToRemove: number): Promise<Batch> {
    try {
      // URL: http://localhost:7777/api/batches/{id}/remove-animals?animalsToRemove=...
      const response = await batchApiInstance.patch<BatchResponse>(
        `/batches/${id}/remove-animals?animalsToRemove=${animalsToRemove}`,
      );
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error al remover animales del lote con ID ${id}:`, error);
      throw error;
    }
  },
};