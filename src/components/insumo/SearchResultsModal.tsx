import type React from "react"
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { useInsumoStore } from "../../store/useInsumoStore"
import type { Insumo } from "../../types/insumo"

type SearchResultsModalProps = {
  isOpen: boolean
  onClose: () => void
  results: Insumo[]
  searchTerm: string
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isOpen, onClose, results, searchTerm }) => {
  const { setActiveInsumo, deleteInsumo } = useInsumoStore()

  if (!isOpen) return null

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible"

    try {
      const date = new Date(dateString + "Z")
      if (isNaN(date.getTime())) {
        console.error("Fecha inválida:", dateString)
        return "Fecha inválida"
      }
      return date.toLocaleDateString("es-ES", { timeZone: "UTC" })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Error de formato"
    }
  }

  // Función para formatear el valor como moneda
  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      console.error("Valor inválido:", value)
      return "Valor no disponible"
    }

    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(value)
    } catch (error) {
      console.error("Error al formatear valor:", error)
      return "Error de formato"
    }
  }

  // Función para manejar la edición de un insumo
  const handleEdit = (id: string) => {
    setActiveInsumo(id)
    onClose() // Cerrar este modal para mostrar el modal de edición
  }

  // Función para manejar la eliminación de un insumo
  const handleDelete = (id: string, nombre: string) => {
    toast.info(
      <div className="flex flex-col items-center gap-2">
        <p>
          ¿Estás seguro de que deseas eliminar el insumo <strong>{nombre}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            className="rounded-lg font-extrabold bg-green-400 text-slate-600 p-2 w-24 whitespace-nowrap text-center"
            onClick={async () => {
              await deleteInsumo(id)
              toast.success("Insumo eliminado correctamente")
            }}
          >
            Eliminar
          </button>
          <button
            className="rounded-lg font-extrabold bg-red-400 text-slate-600 p-2 w-24 whitespace-nowrap text-center"
            onClick={() => toast.dismiss()}
          >
            Cancelar
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      },
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            Resultados de búsqueda: <span className="text-blue-600">"{searchTerm}"</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 overflow-auto flex-grow">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron insumos que coincidan con "{searchTerm}"
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                Se encontraron {results.length} insumo(s) que coinciden con "{searchTerm}"
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Nombre</th>
                      <th className="py-2 px-4 border-b text-left">Tipo</th>
                      <th className="py-2 px-4 border-b text-left">Etapa</th>
                      <th className="py-2 px-4 border-b text-left">Cantidad</th>
                      <th className="py-2 px-4 border-b text-left">Presentación</th>
                      <th className="py-2 px-4 border-b text-left">Valor</th>
                      <th className="py-2 px-4 border-b text-left">Fecha</th>
                      <th className="py-2 px-4 border-b text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((insumo) => (
                      <tr key={insumo.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{insumo.nombre}</td>
                        <td className="py-2 px-4 border-b">{insumo.type}</td>
                        <td className="py-2 px-4 border-b">{insumo.type === "FOOD" ? insumo.stage : "No aplica"}</td>
                        <td className="py-2 px-4 border-b">{insumo.cantidad}</td>
                        <td className="py-2 px-4 border-b">{insumo.presentacion}</td>
                        <td className="py-2 px-4 border-b">{formatCurrency(insumo.valor)}</td>
                        <td className="py-2 px-4 border-b">{formatDate(insumo.fechaIngreso)}</td>
                        <td className="py-2 px-4 border-b">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(insumo.id)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(insumo.id, insumo.nombre)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsModal
