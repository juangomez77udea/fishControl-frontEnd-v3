import { api } from "../api/api";
import type { Insumo, DraftInsumo, Presentacion, Stage, InsumoType } from "../types/insumo";

// Tipos para mapear los datos del backend
type SupplyResponse = {
  id: number;
  suppliesName: string;
  presentation: string;
  suppliesQuantity: number;
  suppliesPrice: number;
  suppliesDate: string;
  type: string;
  stage?: string;
};

// Función para convertir la respuesta del backend al formato del frontend
const mapSupplyToInsumo = (supply: SupplyResponse): Insumo => {
  const validPresentacion = (presentation: string): Presentacion => {
    const validPresentaciones: Presentacion[] = [
      "40kg",
      "20kg",
      "Kilogramos",
      "Gramo",
      "Litro",
      "Mililitro",
      "Unidad",
      "Caja",
      "Paquete",
    ];

    return validPresentaciones.includes(presentation as Presentacion)
      ? (presentation as Presentacion)
      : "Unidad";
  };

  // Validar el tipo de insumo
  const validTypes: InsumoType[] = ["FOOD", "MEDICINE", "EQUIPMENT", "PACKAGING", "DISINFECTANT", "OTHER"];
  const tipoInsumo = validTypes.includes(supply.type as InsumoType) ? (supply.type as InsumoType) : "OTHER";

  // Asegurarse de que los valores numéricos sean números
  const cantidad = typeof supply.suppliesQuantity === "number" ? supply.suppliesQuantity : 0;
  const valor = typeof supply.suppliesPrice === "number" ? supply.suppliesPrice : 0;

  // Asegurarse de que la fecha esté en formato ISO (UTC)
  const fechaIngreso = supply.suppliesDate ? new Date(supply.suppliesDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    id: supply.id.toString(),
    nombre: supply.suppliesName,
    presentacion: validPresentacion(supply.presentation),
    cantidad: cantidad,
    valor: valor,
    fechaIngreso: fechaIngreso,
    type: tipoInsumo, // Convertir a InsumoType
    stage: supply.stage as Stage | undefined, // Convertir a Stage
  };
};

// Función para convertir datos del frontend al formato del backend
const mapInsumoToSupply = (insumo: DraftInsumo): SupplyResponse => {
  const cantidad = typeof insumo.cantidad === "string" ? Number.parseFloat(insumo.cantidad) : insumo.cantidad;
  const valor = typeof insumo.valor === "string" ? Number.parseFloat(insumo.valor) : insumo.valor;

  // Asegurarse de que la fecha esté en formato ISO (UTC)
  const fechaFormateada = insumo.fechaIngreso ? new Date(insumo.fechaIngreso).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    id: 0, // El backend generará el ID automáticamente al crear un nuevo insumo
    suppliesName: insumo.nombre,
    presentation: insumo.presentacion,
    suppliesQuantity: cantidad,
    suppliesPrice: valor,
    suppliesDate: fechaFormateada,
    type: insumo.type, // Enviar el tipo correctamente
    stage: insumo.stage, // Enviar la etapa correctamente
  };
};

// Servicio para gestionar los insumos
export const insumoService = {
  async getAll(): Promise<Insumo[]> {
    try {
      const response = await api.get<SupplyResponse[]>("/supplies");
      return response.data.map(mapSupplyToInsumo);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Insumo> {
    try {
      const response = await api.get<SupplyResponse>(`/supplies/${id}`);
      return mapSupplyToInsumo(response.data);
    } catch (error) {
      console.error(`Error al obtener insumo con ID ${id}:`, error);
      throw error;
    }
  },

  async create(insumo: DraftInsumo): Promise<Insumo> {
    try {
      const supplyData = mapInsumoToSupply(insumo);
      const response = await api.post<SupplyResponse>("/supplies", supplyData);
      return mapSupplyToInsumo(response.data);
    } catch (error) {
      console.error("Error al crear insumo:", error);
      throw error;
    }
  },

  async update(id: string, insumo: DraftInsumo): Promise<Insumo> {
    try {
      const supplyData = mapInsumoToSupply(insumo);
      const response = await api.put<SupplyResponse>(`/supplies/${id}`, supplyData);
      return mapSupplyToInsumo(response.data);
    } catch (error) {
      console.error(`Error al actualizar insumo con ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/supplies/${id}`);
    } catch (error) {
      console.error(`Error al eliminar insumo con ID ${id}:`, error);
      throw error;
    }
  },
};