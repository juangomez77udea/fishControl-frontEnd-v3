// src/store/product-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware"; // No se usa persist aquí, puedes quitarlo si no es necesario
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { productService, type Product, type CreateProductPayload } from "../service/product-service";

// Interfaz para errores de validación del backend
interface ValidationError {
  defaultMessage?: string;
  msg?: string; // Depende de cómo tu backend formatee los errores de validación
}

// --- ESTA ES LA LÍNEA CLAVE ---
export type ProductState = { // <--- DEBE TENER 'export'
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (payload: CreateProductPayload) => Promise<Product | null>;
};

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({ // Añadir get si lo necesitas
      products: [],
      isLoading: false,
      error: null,

      fetchProducts: async () => {
        if (get().isLoading) return;
        try {
          set({ isLoading: true, error: null });
          const products = await productService.getAllProducts();
          set({ products, isLoading: false });
        } catch (error) {
          const errorMessage = "Error al cargar los productos.";
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      createProduct: async (payload) => {
        try {
          set({ isLoading: true, error: null });
          const newProduct = await productService.createProduct(payload);
          if (newProduct) { // Verificar si newProduct no es null
            set((state) => ({
              products: [...state.products, newProduct],
              isLoading: false,
            }));
            toast.success(`Producto "${newProduct.name}" registrado correctamente.`);
            return newProduct;
          }
           throw new Error("La creación del producto no devolvió datos válidos.");
        } catch (error) {
          let errorMessage = "Error al registrar el producto.";
          if (isAxiosError(error) && error.response?.data) {
            const errorData = error.response.data as { message?: string, errors?: ValidationError[] };
            if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors
                .map((err: ValidationError) => err.defaultMessage || err.msg)
                .filter(Boolean) // Filtrar undefined o null messages
                .join(', ');
            }
          }
          console.error(errorMessage, error);
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage || "Ocurrió un error desconocido al crear el producto.");
          return null;
        }
      },
    }),
    {
      name: "product-storage",
      // Opcional: solo persistir la lista de productos
      // partialize: (state) => ({ products: state.products }),
    }
  )
);