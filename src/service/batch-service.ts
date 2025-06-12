// src/service/batch-service.ts

import { batchApiInstance } from "../api/batchApi";

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

// Tipo del modelo para el frontend. Ya incluye specieName.
export type Batch = {
  id: string;
  quantityAnimals: number;
  averageWeight: number;
  entryDate: string;
  batchAge: number;
  animalsRemoved: number;
  specieId: string; 
  specieName?: string; 
};

// --- NUEVO ---
// Tipo explícito para los datos que se envían a la API de lotes.
// Esto representa el contrato exacto con el endpoint de creación de lotes.
export type CreateBatchPayload = {
  quantityAnimals: number;
  averageWeight: number;
  entryDate: string; // Debe estar en formato "YYYY-MM-DD"
  batchAge: number;
  specieId: string;
};


// --- MODIFICADO ---
// Función para convertir la respuesta del backend al formato del frontend
const mapBatchResponseToBatch = (batch: BatchResponse): Batch => {
  return {
    id: batch.batchId.toString(),
    quantityAnimals: batch.quantityAnimalsPerBatch,
    averageWeight: batch.averageWeightPerAnimal,
    // Formatea la fecha para visualización
    entryDate: new Date(batch.entryDate).toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    batchAge: batch.batchAge,
    animalsRemoved: batch.animalsRemoved,
    // Añadimos un valor por defecto. El store se encargará de poner el nombre correcto al crear.
    specieName: 'No especificada',
    specieId: batch.specieId.toString(),
  }
}

export const batchService = {
  async getAll(): Promise<Batch[]> {
    try {
      const response = await batchApiInstance.get<BatchResponse[]>("/batches/");
      return response.data.map(mapBatchResponseToBatch);
    } catch (error) {
      console.error("Error al obtener lotes:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Batch> {
    try {
      const response = await batchApiInstance.get<BatchResponse>(`/batches/${id}`);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error al obtener lote con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Método 'create' 
  async create(batchPayload: CreateBatchPayload): Promise<Batch> {
    try {
      // Mapeamos los datos de payload al formato que el backend espera (DTO).
      const batchDataForApi = {
        quantityAnimalsPerBatch: batchPayload.quantityAnimals,
        averageWeightPerAnimal: batchPayload.averageWeight,
        entryDate: batchPayload.entryDate,
        batchAge: batchPayload.batchAge,
        specieId: parseInt(batchPayload.specieId, 10),
      };

      console.log("Enviando datos de lote al backend:", batchDataForApi);
      const response = await batchApiInstance.post<BatchResponse>("/batches/", batchDataForApi);
      
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error("Error al crear lote:", error);
      throw error;
    }
  },

  async update(id: string, batch: Partial<Omit<Batch, "id" | "entryDate" | "animalsRemoved">>): Promise<Batch> {
    try {
      // Mapea solo los campos que se pueden actualizar según el backend
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

      const response = await batchApiInstance.put<BatchResponse>(`/batches/${id}`, batchDataToUpdate);
      return mapBatchResponseToBatch(response.data);
    } catch (error) {
      console.error(`Error al actualizar lote con ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await batchApiInstance.delete(`/batches/${id}`);
    } catch (error) {
      console.error(`Error al eliminar lote con ID ${id}:`, error);
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
      console.error(`Error al remover animales del lote con ID ${id}:`, error);
      throw error;
    }
  },
};