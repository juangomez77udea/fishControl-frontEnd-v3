import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { DraftInsumo, Insumo } from "../types/insumo";

type InsumoState = {
  insumos: Insumo[];
  isModalOpen: boolean;
  activeId: string | null;
  isLoading: boolean; // Agregar isLoading
  openModal: () => void;
  closeModal: () => void;
  addInsumo: (data: DraftInsumo) => void;
  deleteInsumo: (id: string) => void;
  setActiveInsumo: (id: string | null) => void;
  updateInsumo: (data: DraftInsumo) => void;
  fetchInsumos: () => void; // Agregar fetchInsumos
};

const createInsumo = (insumo: DraftInsumo): Insumo => {
  return {
    ...insumo,
    id: uuidv4(),
    cantidad: Number(insumo.cantidad) || 0,
    valor: Number(insumo.valor) || 0,
    fechaIngreso: insumo.fechaIngreso || new Date().toISOString().split("T")[0],
  };
};

export const useInsumoStore = create<InsumoState>()(
  devtools(
    persist(
      (set, get) => ({
        insumos: [],
        isModalOpen: false,
        activeId: null,
        isLoading: false, // Inicializar isLoading como false

        // Acciones para el modal
        openModal: () => set({ isModalOpen: true }),
        closeModal: () => set({ isModalOpen: false, activeId: null }),

        // Acciones para insumos
        addInsumo: (data) => {
          const newInsumo = createInsumo(data);
          set((state) => ({
            insumos: [...state.insumos, newInsumo],
          }));
        },

        deleteInsumo: (id) => {
          set((state) => ({
            insumos: state.insumos.filter((insumo) => insumo.id !== id),
          }));
        },

        setActiveInsumo: (id) => {
          set({ activeId: id });
        },

        updateInsumo: (data) => {
          const { activeId } = get();
          if (!activeId) return;

          set((state) => ({
            insumos: state.insumos.map((insumo) =>
              insumo.id === activeId ? { id: activeId, ...data } : insumo
            ),
            activeId: null,
          }));
        },

        // Simular la carga de insumos
        fetchInsumos: () => {
          set({ isLoading: true }); // Activar el estado de carga
          setTimeout(() => {
            // Simular una llamada a una API
            const datosEjemplo: Insumo[] = [
              {
                id: "1",
                nombre: "Alimento para peces",
                cantidad: 100,
                presentacion: "Kilogramo",
                valor: 50000,
                fechaIngreso: "2023-05-15",
              },
              {
                id: "2",
                nombre: "Oxigenador",
                cantidad: 5,
                presentacion: "Unidad",
                valor: 120000,
                fechaIngreso: "2023-06-20",
              },
            ];
            set({ insumos: datosEjemplo, isLoading: false }); // Desactivar el estado de carga
          }, 1000); // Simular un retraso de 1 segundo
        },
      }),
      {
        name: "insumo-storage",
      }
    )
  )
);