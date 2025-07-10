import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { dailyRecordService, type DailyRecord, type CreateDailyRecordPayload } from "../service/dailyRecord-service";
import { insumoService } from "../service/InsumoService";
import { useInsumoStore, type InsumoState } from "./useInsumoStore";
import type { Insumo } from "../types/insumo";

export type DailyRecordState = {
  dailyRecordsByBatch: Record<string, DailyRecord[]>;
  isLoading: boolean;
  error: string | null;
  fetchDailyRecordsByBatchId: (batchId: string | number) => Promise<void>;
  createDailyRecord: (payload: CreateDailyRecordPayload) => Promise<DailyRecord | null>;
};

export const useDailyRecordStore = create<DailyRecordState>()(
  devtools(
    (set, get) => ({
      dailyRecordsByBatch: {},
      isLoading: false,
      error: null,

      fetchDailyRecordsByBatchId: async (batchId) => {
        if (get().isLoading) return;
        try {
          set({ isLoading: true, error: null });
          const records = await dailyRecordService.getAllByBatchId(batchId);
          set((state) => ({
            dailyRecordsByBatch: {
              ...state.dailyRecordsByBatch,
              [batchId.toString()]: records,
            },
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = `Error al cargar registros diarios para el lote ${batchId}.`;
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      createDailyRecord: async (payload) => {
        try {
          set({ isLoading: true, error: null });
          
          const newRecord = await dailyRecordService.create(payload);
          
          if (newRecord) {
            const updatedInsumo = await insumoService.reduceStock(payload.foodSupplyId, payload.foodSuppliedKg);

            useInsumoStore.setState((state: InsumoState) => ({
              insumos: state.insumos.map((insumo: Insumo) => 
                insumo.id === updatedInsumo.id
                  ? updatedInsumo
                  : insumo
              )
            }));

            set((state) => {
              const batchIdStr = newRecord.batchId.toString();
              const existingRecords = state.dailyRecordsByBatch[batchIdStr] || [];
              return {
                dailyRecordsByBatch: {
                  ...state.dailyRecordsByBatch,
                  [batchIdStr]: [...existingRecords, newRecord],
                },
                isLoading: false,
              };
            });
            
            toast.success(`Registro diario creado y stock actualizado.`);
            return newRecord;
          }
          throw new Error("La creación del registro diario no devolvió datos.");
        } catch (error) {
          let errorMessage = "Error al crear el registro diario.";
           if (isAxiosError(error) && error.response?.data) {
            const errorData = error.response.data as { message?: string, errors?: { defaultMessage?: string, msg?: string }[] };
            if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map((err) => err.defaultMessage || err.msg).filter(Boolean).join(', ');
            }
          }
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage || "Error desconocido al crear registro diario.");
          return null;
        }
      },
    }),
    {
      name: "daily-record-storage",
    }
  )
);