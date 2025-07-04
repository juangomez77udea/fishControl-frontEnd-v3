import { batchApiInstance } from "../api/batchApi";
import { productApiInstance } from "../api/productApi";
// Tipos para la respuesta del backend y el modelo del frontend
export type BatchResponse = {
  batchId: number;
  quantityAnimalsPerBatch: number;
  averageWeightPerAnimal: number;
  entryDate: string;
  batchAge: number;
  animalsRemoved: number;
  specieId: number;
};

export type Batch = {
  id: string; // batchId convertido a string
  quantityAnimals: number;
  averageWeight: number;
  entryDate: string; // Fecha formateada para mostrar
  batchAge: number;
  animalsRemoved: number;
  specieId: string; // specieId convertido a string
  specieName?: string; // Se llenará en el componente Producto.tsx
};

export type CreateBatchPayload = {
  quantityAnimals: number;
  averageWeight: number;
  entryDate: string; // Formato "YYYY-MM-DD" para enviar al backend
  batchAge: number;
  specieId: string; // ID de la especie como string (se convertirá a número antes de enviar)
};

const mapBatchResponseToBatch = (batch: BatchResponse): Batch => {
  return {
    id: batch.batchId.toString(),
    quantityAnimals: batch.quantityAnimalsPerBatch,
    averageWeight: batch.averageWeightPerAnimal,
    entryDate: new Date(batch.entryDate).toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    batchAge: batch.batchAge,
    animalsRemoved: batch.animalsRemoved,
    specieId: batch.specieId.toString(),
  };
};

export const batchService = {
  async getAll(): Promise<Batch[]> {
    try {
      const response = await batchApiInstance.get<BatchResponse[]>("/batches/");
      return response.data.map(mapBatchResponseToBatch);
    } catch (error) {
      console.error("Error en batchService.getAll:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Batch> {
    try {
      const response = await batchApiInstance.get<BatchResponse>(`/batches/${id}`);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error en batchService.getById con ID ${id}:`, error);
      throw error;
    }
  },
  
  async create(batchPayload: CreateBatchPayload): Promise<Batch> {
    try {
      const batchDataForApi = {
        quantityAnimalsPerBatch: batchPayload.quantityAnimals,
        averageWeightPerAnimal: batchPayload.averageWeight,
        entryDate: batchPayload.entryDate, // Debe ser "YYYY-MM-DD"
        batchAge: batchPayload.batchAge,
        specieId: parseInt(batchPayload.specieId, 10),
      };
      console.log("batchService: Enviando para crear lote:", batchDataForApi);
      const response = await batchApiInstance.post<BatchResponse>("/batches/", batchDataForApi);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error("Error en batchService.create:", error);
      throw error;
    }
  },

  async update(id: string, batch: Partial<Omit<Batch, "id" | "entryDate" | "animalsRemoved" | "specieId" | "specieName">>): Promise<Batch> {
    try {
      const batchDataToUpdate: {
        quantityAnimalsPerBatch?: number;
        averageWeightPerAnimal?: number;
        batchAge?: number;
        // specieId no se actualiza directamente aquí, se asume que es parte de la creación del producto
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

      const response = await batchApiInstance.put<BatchResponse>(`/batches/${id}`, batchDataToUpdate);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error en batchService.update con ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await batchApiInstance.delete(`/batches/${id}`);
    } catch (error) {
      console.error(`Error en batchService.delete con ID ${id}:`, error);
      throw error;
    }
  },

  async removeAnimals(id: string, animalsToRemove: number): Promise<Batch> {
    try {
      const response = await batchApiInstance.patch<BatchResponse>(
        `/batches/${id}/remove-animals?animalsToRemove=${animalsToRemove}`,
      );
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error en batchService.removeAnimals del lote con ID ${id}:`, error);
      throw error;
    }
  },

  async updateWeight(batchId: number, newWeight: number): Promise<void> {
    try {
      const payload = { averageWeightPerAnimal: newWeight };
      // La llamada se hace al product-service, que actúa como proxy
      await productApiInstance.patch(`/proxy/batches/${batchId}/update-weight`, payload);
    } catch (error) {
      console.error(`Error en batchService.updateWeight con ID ${batchId}:`, error);
      throw error;
    }
  },  

};