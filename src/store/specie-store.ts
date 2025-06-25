// src/store/specie-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware"; // No se usa persist aquí, puedes quitarlo si no es necesario
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { specieService, type Specie, type CreateSpecie } from "../service/specie-service";

// --- ESTA ES LA LÍNEA CLAVE ---
export type SpecieState = { // <--- DEBE TENER 'export'
  species: Specie[];
  isLoading: boolean;
  error: string | null;
  fetchSpecies: () => Promise<void>;
  createSpecie: (specieData: CreateSpecie) => Promise<Specie | null>;
};

export const useSpecieStore = create<SpecieState>()(
  devtools(
    (set, get) => ({
      species: [],
      isLoading: false,
      error: null,

      fetchSpecies: async () => {
        if (get().isLoading) return; // Evitar recargar si ya está cargando
        try {
          set({ isLoading: true, error: null });
          const species = await specieService.getAll();
          set({ species, isLoading: false });
        } catch (error) {
          const errorMessage = "Error al cargar las especies.";
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      createSpecie: async (specieData) => {
        try {
          set({ isLoading: true, error: null });
          const newSpecie = await specieService.create(specieData);
          if (newSpecie) { // Verificar si newSpecie no es null
            set((state) => ({
              species: [...state.species, newSpecie],
              isLoading: false,
            }));
            toast.success(`Especie "${newSpecie.name}" creada correctamente.`);
            return newSpecie;
          }
          // Si newSpecie es null (por ejemplo, si el servicio devuelve null en error)
          throw new Error("La creación de la especie no devolvió datos válidos.");
        } catch (error) {
          let errorMessage = "Error al crear la especie.";
          if (isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message as string; // Asegurar que es string
          }
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },
    }),
    {
      name: "specie-storage",
      // Si no quieres persistir el estado de especies, puedes quitar `partialize` o todo el objeto de persistencia.
      // O si quieres persistir todo:
      // version: 1, // Opcional para migraciones de persistencia
    }
  )
);