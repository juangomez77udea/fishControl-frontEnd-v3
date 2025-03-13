// Tipos de presentación permitidos
export type Presentacion = "40kg" | "20kg" | "Kilogramos" | "Gramo" | "Litro" | "Mililitro" | "Unidad" | "Caja" | "Paquete";

// Tipos de insumos permitidos
export type InsumoType = "FOOD" | "MEDICINE" | "EQUIPMENT" | "PACKAGING" | "DISINFECTANT" | "OTHER";

// Etapas permitidas para los alimentos
export type Stage = "cría" | "destete" | "levante" | "engorde";

// Tipo para un insumo en proceso de creación (sin ID)
export type DraftInsumo = {
  nombre: string;
  cantidad: number; 
  presentacion: Presentacion;
  valor: number; 
  fechaIngreso: string; 
  type: InsumoType; 
  stage?: Stage; // Etapa del cultivo (solo aplica para alimentos)
};

// Tipo para un insumo completo (con ID)
export type Insumo = DraftInsumo & {
  id: string;
};