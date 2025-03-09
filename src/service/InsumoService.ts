import { api } from "../api/api";
import type { Insumo, DraftInsumo, Presentacion } from "../types/insumo";

// Types para mapear los datos del backend
type SupplyResponse = {
  id: number;
  suppliesName: string;
  presentation: string;
  suppliesQuantity: number;
  suppliesPrice: number;
  suppliesDate: string;
};

type CreateSupplyRequest = {
  suppliesName: string;
  presentation: string;
  suppliesQuantity: number;
  suppliesPrice: number;
  suppliesDate: string;
};

// Función para convertir la respuesta del backend al formato del frontend
const mapSupplyToInsumo = (supply: SupplyResponse): Insumo => {
  const validPresentacion = (presentation: string): Presentacion => {
    const validPresentaciones: Presentacion[] = [
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
  };
};

// Función para manejar fechas en formato ISO (UTC)
const formatDateToISO = (dateString: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  try {
    // Crear un objeto Date a partir del string en UTC
    const date = new Date(dateString + 'Z');
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", dateString);
      return new Date().toISOString().split("T")[0];
    }

    // Obtener año, mes y día en UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    // Formatear como YYYY-MM-DD
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error, "para la fecha:", dateString);
    return new Date().toISOString().split("T")[0];
  }
};

// Función para convertir datos del frontend al formato del backend
const mapInsumoToSupply = (insumo: DraftInsumo): CreateSupplyRequest => {
  const cantidad = typeof insumo.cantidad === "string" ? Number.parseFloat(insumo.cantidad) : insumo.cantidad;
  const valor = typeof insumo.valor === "string" ? Number.parseFloat(insumo.valor) : insumo.valor;

  // Asegurarse de que la fecha esté en formato ISO (UTC)
  let fechaFormateada: string;

  if (typeof insumo.fechaIngreso === "string") {
    fechaFormateada = formatDateToISO(insumo.fechaIngreso);
    console.log("Fecha original:", insumo.fechaIngreso, "Fecha formateada:", fechaFormateada);
  } else {
    fechaFormateada = formatDateToISO(new Date().toISOString());
  }

  // Agregar un log para ver los datos que se envían al backend
  const supplyData = {
    suppliesName: insumo.nombre,
    presentation: insumo.presentacion,
    suppliesQuantity: cantidad,
    suppliesPrice: valor,
    suppliesDate: fechaFormateada,
  };

  console.log("Datos enviados al backend:", supplyData);

  return supplyData;
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

  // Obtener un insumo por ID
  async getById(id: string): Promise<Insumo> {
    try {
      const response = await api.get<SupplyResponse>(`/supplies/${id}`);
      return mapSupplyToInsumo(response.data);
    } catch (error) {
      console.error(`Error al obtener insumo con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo insumo
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

  // Actualizar un insumo existente
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

  // Eliminar un insumo
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/supplies/${id}`);
    } catch (error) {
      console.error(`Error al eliminar insumo con ID ${id}:`, error);
      throw error;
    }
  },
};