import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from 'react-toastify';
import type { Supply } from "../service/supply-service";
import { supplyService } from "../service/supply-service";

export interface SupplyState {
  foodSupplies: Supply[];
  isLoading: boolean;
  error: string | null;
  fetchFoodSupplies: () => Promise<void>;
}

export const useSupplyStore = create<SupplyState>()(
  devtools(
    (set, get) => ({
      foodSupplies: [],
      isLoading: false,
      error: null,

      fetchFoodSupplies: async () => {
        if (get().isLoading) return;
        try {
          set({ isLoading: true, error: null });
          const supplies = await supplyService.getFoodSupplies();
          set({ foodSupplies: supplies, isLoading: false });
        } catch (error) {
          const errorMessage = "Error al cargar los insumos de alimento.";
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },
    }),
    {
      name: "supply-storage",
    }
  )
);