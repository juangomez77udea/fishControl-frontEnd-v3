import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { specieService, type Specie, type CreateSpecie } from "../service/specie-service";

type SpecieState = {
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
        // Evita recargar si ya hay especies o si ya está cargando
        if (get().species.length > 0 || get().isLoading) return;
        
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
          set((state) => ({
            species: [...state.species, newSpecie],
            isLoading: false,
          }));
          toast.success(`Especie "${newSpecie.name}" creada correctamente.`);
          return newSpecie;
        } catch (error) {
          let errorMessage = "Error al crear la especie.";
          if (isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
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
    }
  )
);