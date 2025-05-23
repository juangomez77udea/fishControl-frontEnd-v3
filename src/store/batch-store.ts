import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { batchService, type Batch } from "../service/batch-service"
import { toast } from "react-toastify"
import { isAxiosError } from "axios"

type BatchState = {
  batches: Batch[]
  selectedBatchId: string | null
  isLoading: boolean
  error: string | null

  // Acciones
  fetchBatches: () => Promise<void>
  selectBatch: (id: string | null) => void
  createBatch: (batch: Omit<Batch, "id">) => Promise<void>
  updateBatch: (id: string, batch: Partial<Batch>) => Promise<void>
  deleteBatch: (id: string) => Promise<void>
  removeAnimals: (id: string, animalsToRemove: number) => Promise<void>
}

export const useBatchStore = create<BatchState>()(
  devtools(
    persist(
      (set) => ({
        batches: [],
        selectedBatchId: null,
        isLoading: false,
        error: null,

        fetchBatches: async () => {
          try {
            set({ isLoading: true, error: null })
            const batches = await batchService.getAll()
            set({ batches, isLoading: false })
          } catch (error) {
            console.error("Error al cargar lotes:", error)
            set({
              isLoading: false,
              error: "Error al cargar lotes. Por favor, inténtalo de nuevo.",
            })
            toast.error("Error al cargar lotes")
          }
        },

        selectBatch: (id) => {
          set({ selectedBatchId: id })
        },

        createBatch: async (batch) => {
          try {
            set({ isLoading: true, error: null })
            const newBatch = await batchService.create(batch)
            set((state) => ({
              batches: [...state.batches, newBatch],
              isLoading: false,
            }))
            toast.success("Lote creado correctamente")
          } catch (error) {
            console.error("Error al crear lote:", error)
            set({
              isLoading: false,
              error: "Error al crear lote. Por favor, inténtalo de nuevo.",
            })

            if (isAxiosError(error)) {
              if (error.response) {
                // Mostrar mensaje de error específico del backend
                const statusCode = error.response.status
                const errorData = error.response.data

                if (statusCode === 400) {
                  // Error de validación
                  if (typeof errorData === "string") {
                    toast.error(errorData)
                  } else if (errorData && typeof errorData === "object" && errorData.message) {
                    toast.error(errorData.message)
                  } else {
                    toast.error("Error de validación en el servidor")
                  }
                } else if (statusCode === 401) {
                  toast.error("No estás autorizado para realizar esta acción")
                } else if (statusCode === 403) {
                  toast.error("No tienes permisos para realizar esta acción")
                } else {
                  toast.error("Error al procesar la solicitud en el servidor")
                }
              } else if (error.request) {
                toast.error("No se recibió respuesta del servidor")
              } else {
                toast.error("Error al procesar la solicitud")
              }
            } else {
              toast.error("Error al crear lote")
            }
          }
        },

        updateBatch: async (id, batch) => {
          try {
            set({ isLoading: true, error: null })
            const updatedBatch = await batchService.update(id, batch)
            set((state) => ({
              batches: state.batches.map((b) => (b.id === id ? updatedBatch : b)),
              isLoading: false,
            }))
            toast.success("Lote actualizado correctamente")
          } catch (error) {
            console.error("Error al actualizar lote:", error)
            set({
              isLoading: false,
              error: "Error al actualizar lote. Por favor, inténtalo de nuevo.",
            })

            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al actualizar lote")
            } else {
              toast.error("Error al actualizar lote")
            }
          }
        },

        deleteBatch: async (id) => {
          try {
            set({ isLoading: true, error: null })
            await batchService.delete(id)
            set((state) => ({
              batches: state.batches.filter((batch) => batch.id !== id),
              selectedBatchId: state.selectedBatchId === id ? null : state.selectedBatchId,
              isLoading: false,
            }))
            toast.success("Lote eliminado correctamente")
          } catch (error) {
            console.error("Error al eliminar lote:", error)
            set({
              isLoading: false,
              error: "Error al eliminar lote. Por favor, inténtalo de nuevo.",
            })

            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al eliminar lote")
            } else {
              toast.error("Error al eliminar lote")
            }
          }
        },

        removeAnimals: async (id, animalsToRemove) => {
          try {
            set({ isLoading: true, error: null })
            const updatedBatch = await batchService.removeAnimals(id, animalsToRemove)
            set((state) => ({
              batches: state.batches.map((b) => (b.id === id ? updatedBatch : b)),
              isLoading: false,
            }))
            toast.success("Animales removidos correctamente")
          } catch (error) {
            console.error("Error al remover animales:", error)
            set({
              isLoading: false,
              error: "Error al remover animales. Por favor, inténtalo de nuevo.",
            })

            if (isAxiosError(error) && error.response) {
              toast.error(error.response.data?.message || "Error al remover animales")
            } else {
              toast.error("Error al remover animales")
            }
          }
        },
      }),
      {
        name: "batch-storage",
        partialize: (state) => ({ batches: state.batches }),
      },
    ),
  ),
)
