// src/service/dailyRecord-service.ts

import { productApiInstance } from '../api/productApi'; 

export interface CreateDailyRecordPayload {
  batchId: number;
  pondIdentifier: string;
  recordDate?: string; 
  foodSuppliedKg: number;
  mortality: number;
  foodSupplyId: number;
}

export interface DailyRecordResponse { 
  id: number;
  batchId: number;
  pondIdentifier: string;
  recordDate: string; 
  foodSuppliedKg: number;
  mortality: number;
  creationTimestamp: string;
  updateTimestamp: string | null;

}

export type DailyRecord = DailyRecordResponse;

const mapDailyRecordResponse = (response: DailyRecordResponse): DailyRecord => {
  return response; 
};

export const dailyRecordService = {
  async create(payload: CreateDailyRecordPayload): Promise<DailyRecord> {
    try {
      console.log("dailyRecordService: Enviando para crear registro diario:", payload);
      //  AQUÍ ESTÁ LA CORRECCIÓN. La ruta no debe empezar con /api si la baseURL ya lo contiene.
      //  Tu controlador está en "/api/daily-records", así que la ruta relativa es "/daily-records".
      const response = await productApiInstance.post<DailyRecordResponse>("/daily-records", payload);
      console.log("dailyRecordService: Registro diario creado:", response.data);
      return mapDailyRecordResponse(response.data);
    } catch (error) {
      console.error("Error en dailyRecordService.create:", error);
      throw error;
    }
  },

  async getAllByBatchId(batchId: string | number): Promise<DailyRecord[]> {
    try {
        //  AQUÍ ESTÁ LA CORRECCIÓN. Misma lógica.
        const response = await productApiInstance.get<DailyRecordResponse[]>(`/daily-records/batch/${batchId}`);
        return response.data.map(mapDailyRecordResponse);
    } catch (error)        {
        console.error(`Error obteniendo registros diarios para batchId ${batchId}:`, error);
        throw error;
    }
  }
};