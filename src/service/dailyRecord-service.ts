import { productApiInstance } from '../api/productApi'; 

export interface CreateDailyRecordPayload {
  batchId: number;
  pondIdentifier: string;
  recordDate?: string; 
  foodSuppliedKg: number;
  mortality: number;
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
        const response = await productApiInstance.get<DailyRecordResponse[]>(`/daily-records/batch/${batchId}`);
        return response.data.map(mapDailyRecordResponse);
    } catch (error) {
        console.error(`Error obteniendo registros diarios para batchId ${batchId}:`, error);
        throw error;
    }
  }
};