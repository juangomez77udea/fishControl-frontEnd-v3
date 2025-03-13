import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DraftInsumo, Insumo } from "../types/insumo";
import { insumoService } from "../service/InsumoService";
import { toast } from "react-toastify";

type InsumoState = {
  insumos: Insumo[];
  isModalOpen: boolean;
  activeId: string | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  addInsumo: (data: DraftInsumo) => Promise<void>;
  deleteInsumo: (id: string) => Promise<void>;
  setActiveInsumo: (id: string | null) => void;
  updateInsumo: (data: DraftInsumo) => Promise<void>;
  fetchInsumos: () => Promise<void>;
};

export const useInsumoStore = create<InsumoState>()(
  devtools(
    persist(
      (set, get) => ({
        insumos: [],
        isModalOpen: false,
        activeId: null,
        isLoading: false,
        error: null,

        // Acciones para el modal
        openModal: () => set({ isModalOpen: true }),
        closeModal: () => set({ isModalOpen: false, activeId: null }),

        // Acciones para insumos
        addInsumo: async (data) => {
          try {
            set({ isLoading: true, error: null });
            const newInsumo = await insumoService.create(data);
            set((state) => ({
              insumos: [...state.insumos, newInsumo],
              isLoading: false,
            }));
            toast.success("Insumo agregado correctamente");
          } catch (error) {
            console.error("Error al agregar insumo:", error);
            set({
              isLoading: false,
              error: "Error al agregar insumo. Por favor, inténtalo de nuevo.",
            });
            toast.error("Error al agregar insumo");
          }
        },

        deleteInsumo: async (id) => {
          try {
            set({ isLoading: true, error: null });
            await insumoService.delete(id); // Usar insumoService.delete
            set((state) => ({
              insumos: state.insumos.filter((insumo) => insumo.id !== id),
              isLoading: false,
            }));
            toast.success("Insumo eliminado correctamente");
          } catch (error) {
            console.error("Error al eliminar insumo:", error);
            set({
              isLoading: false,
              error: "Error al eliminar insumo. Por favor, inténtalo de nuevo.",
            });
            toast.error("Error al eliminar insumo");
          }
        },

        setActiveInsumo: (id) => {
          set({ activeId: id, isModalOpen: true });
        },

        updateInsumo: async (data) => {
          const { activeId } = get();
          if (!activeId) return;

          try {
            set({ isLoading: true, error: null });
            const updatedInsumo = await insumoService.update(activeId, data);
            set((state) => ({
              insumos: state.insumos.map((insumo) => (insumo.id === activeId ? updatedInsumo : insumo)),
              isLoading: false,
              activeId: null,
            }));
            toast.success("Insumo actualizado correctamente");
          } catch (error) {
            console.error("Error al actualizar insumo:", error);
            set({
              isLoading: false,
              error: "Error al actualizar insumo. Por favor, inténtalo de nuevo.",
            });
            toast.error("Error al actualizar insumo");
          }
        },

        fetchInsumos: async () => {
          try {
            set({ isLoading: true, error: null });
            const insumos = await insumoService.getAll();
            set({ insumos, isLoading: false });
          } catch (error) {
            console.error("Error al cargar insumos:", error);
            set({
              isLoading: false,
              error: "Error al cargar insumos. Por favor, inténtalo de nuevo.",
            });
            toast.error("Error al cargar insumos");
          }
        },
      }),
      {
        name: "insumo-storage",
        partialize: (state) => ({ insumos: state.insumos }),
      },
    ),
  ),
);