import { create } from 'zustand';


export interface StatisticsState {
  selectedProductId: number | null;
  setSelectedProductId: (productId: number | null) => void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
  selectedProductId: null,
  setSelectedProductId: (productId) => set({ selectedProductId: productId }),
}));