// src/store/batch-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { batchService, type Batch, type CreateBatchPayload } from "../service/batch-service"; // Asegúrate que CreateBatchPayload esté aquí si la acción createBatch lo usa
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

// --- ESTA ES LA LÍNEA CLAVE ---
export type BatchState = { // <--- DEBE TENER 'export'
  batches: Batch[];
  selectedBatchId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchBatches: () => Promise<void>;
  selectBatch: (id: string | null) => void;
  // Ajusta el tipo del parámetro 'batchData' si es necesario
  createBatch: (batchData: CreateBatchPayload) => Promise<Batch | null>; 
  updateBatch: (id: string, batch: Partial<Omit<Batch, "id" | "entryDate" | "animalsRemoved" | "specieId" | "specieName">>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  removeAnimals: (id: string, animalsToRemove: number) => Promise<void>;
};

export const useBatchStore = create<BatchState>()(
  devtools(
    persist(
      (set, get) => ({
        batches: [],
        selectedBatchId: null,
        isLoading: false,
        error: null,

        fetchBatches: async () => {
          if (get().isLoading) return;
          try {
            set({ isLoading: true, error: null });
            const batches = await batchService.getAll();
            set({ batches, isLoading: false });
          } catch (error) {
            console.error("Error al cargar lotes:", error);
            set({ isLoading: false, error: "Error al cargar lotes." });
            toast.error("Error al cargar lotes");
          }
        },

        selectBatch: (id) => {
          set({ selectedBatchId: id });
        },

        createBatch: async (batchData) => { // batchData es CreateBatchPayload
          try {
            set({ isLoading: true, error: null });
            const newBatch = await batchService.create(batchData); // batchService.create debe aceptar CreateBatchPayload
            if (newBatch) {
              set((state) => ({
                batches: [...state.batches, newBatch], // newBatch debe ser de tipo Batch
                isLoading: false,
              }));
              toast.success("Lote creado correctamente");
              return newBatch;
            }
            throw new Error("La creación del lote no devolvió datos.");
          } catch (error) {
            let errorMessage = "Error al crear lote.";
            if (isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message as string;
            }
            console.error(errorMessage, error);
            set({isLoading: false, error: errorMessage});
            toast.error(errorMessage);
            return null;
          }
        },
        
        updateBatch: async (id, batch) => {
          try {
            set({ isLoading: true, error: null });
            const updatedBatch = await batchService.update(id, batch);
            set((state) => ({
              batches: state.batches.map((b) => (b.id === id ? updatedBatch : b)),
              isLoading: false,
            }));
            toast.success("Lote actualizado correctamente");
          } catch (error) {
            console.error("Error al actualizar lote:", error);
            set({isLoading: false, error: "Error al actualizar lote."});
            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al actualizar lote");
            } else {
              toast.error("Error al actualizar lote");
            }
          }
        },

        deleteBatch: async (id) => {
          try {
            set({ isLoading: true, error: null });
            await batchService.delete(id);
            set((state) => ({
              batches: state.batches.filter((b) => b.id !== id),
              selectedBatchId: state.selectedBatchId === id ? null : state.selectedBatchId,
              isLoading: false,
            }));
            toast.success("Lote eliminado correctamente");
          } catch (error) {
            console.error("Error al eliminar lote:", error);
             set({isLoading: false, error: "Error al eliminar lote."});
            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al eliminar lote");
            } else {
              toast.error("Error al eliminar lote");
            }
          }
        },

        removeAnimals: async (id, animalsToRemove) => {
           try {
            set({ isLoading: true, error: null });
            const updatedBatch = await batchService.removeAnimals(id, animalsToRemove);
            set((state) => ({
              batches: state.batches.map((b) => (b.id === id ? updatedBatch : b)),
              isLoading: false,
            }));
            toast.success("Animales removidos correctamente");
          } catch (error) {
            console.error("Error al remover animales:", error);
            set({isLoading: false, error: "Error al remover animales."});
            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al remover animales");
            } else {
              toast.error("Error al remover animales");
            }
          }
        },
      }),
      {
        name: "batch-storage",
        partialize: (state) => ({ batches: state.batches }),
      }
    )
  )
);