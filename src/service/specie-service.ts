import { productApiInstance } from "../api/productApi";

// Tipo que coincide con la respuesta del backend (SpecieResponseDTO)
export type SpecieResponse = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
};

// Tipo que usaremos en el frontend
export type Specie = {
  id: string;
  name: string;
  description?: string;
};

// Tipo para crear una nueva especie (coincide con CreateSpecieDTO)
export type CreateSpecie = {
    name: string;
    description?: string;
}

// Mapea la respuesta del backend
const mapSpecieResponseToSpecie = (specieResponse: SpecieResponse): Specie => {
  return {
    id: specieResponse.id.toString(),
    name: specieResponse.name,
    description: specieResponse.description ?? undefined,
  };
};

export const specieService = {
  // Obtiene todas las especies
  async getAll(): Promise<Specie[]> {
    try {
      const response = await productApiInstance.get<SpecieResponse[]>("/species");
      return response.data.map(mapSpecieResponseToSpecie);
    } catch (error) {
      console.error("Error al obtener las especies:", error);
      throw error;
    }
  },

  // Crea una nueva especie
  async create(specieData: CreateSpecie): Promise<Specie> {
    try {
      const response = await productApiInstance.post<SpecieResponse>("/species", specieData);
      return mapSpecieResponseToSpecie(response.data);
    } catch (error) {
      console.error("Error al crear la especie:", error);
      throw error;
    }
  },
};