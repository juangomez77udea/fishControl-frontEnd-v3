import { productApiInstance } from '../api/productApi';

export type ProductPhase = 'ALEVINAJE' | 'DEDINAJE' | 'LEVANTE' | 'ENGORDE';

export interface CreateProductPayload {
  name: string;
  description?: string;
  phase: ProductPhase;
  specieId: number;
  pondIdentifier: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  phase: ProductPhase;
  createdAt: string;
  updateAt: string | null;
  specieId: number;
  specieName: string;
  pondIdentifier: string;
}

export type Product = ProductResponse;

const mapProductResponseToProduct = (response: ProductResponse): Product => {
  return {
    ...response,
  };
};


export const productService = {
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    try {
      console.log("productService: Enviando para crear producto:", payload);
      const response = await productApiInstance.post<ProductResponse>("/productos", payload);
      console.log("productService: Producto creado:", response.data);
      return mapProductResponseToProduct(response.data);
    } catch (error) {
      console.error("Error en productService.createProduct:", error);
      throw error;
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await productApiInstance.get<ProductResponse[]>("/productos");
      return response.data.map(mapProductResponseToProduct);
    } catch (error) {
      console.error("Error en productService.getAllProducts:", error);
      throw error;
    }
  }
};