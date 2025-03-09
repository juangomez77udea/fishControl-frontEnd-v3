import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaTimes } from "react-icons/fa"
import { toast } from "react-toastify"
import { useInsumoStore } from "../../store/useInsumoStore"
import type { DraftInsumo } from "../../types/insumo"

const presentaciones = ["Kilogramos", "Gramo", "Litro", "Mililitro", "Unidad", "Caja", "Paquete"]

const formatDateToISO = (dateString: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  try {
    // Crear un objeto Date a partir del string en UTC
    const date = new Date(dateString + 'Z'); // Añadir 'Z' para indicar que es UTC
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

const InsumoModal: React.FC = () => {
  const { isModalOpen, closeModal, addInsumo, updateInsumo, activeId, insumos, isLoading } = useInsumoStore()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DraftInsumo>()

  // Estado local para la fecha
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(formatDateToISO(new Date().toString()))

  useEffect(() => {
    if (activeId) {
      const insumoToEdit = insumos.find((i) => i.id === activeId)
      if (insumoToEdit) {
        setValue("nombre", insumoToEdit.nombre)
        setValue("cantidad", insumoToEdit.cantidad)
        setValue("presentacion", insumoToEdit.presentacion)
        setValue("valor", insumoToEdit.valor)

        if (insumoToEdit.fechaIngreso) {
          try {
            const fechaFormateada = formatDateToISO(insumoToEdit.fechaIngreso)
            setValue("fechaIngreso", fechaFormateada)
            setFechaSeleccionada(fechaFormateada)
          } catch (error) {
            console.error("Error al formatear fecha para edición:", error)
            setValue("fechaIngreso", insumoToEdit.fechaIngreso)
            setFechaSeleccionada(insumoToEdit.fechaIngreso)
          }
        }
      }
    } else {
      const fechaHoy = formatDateToISO(new Date().toString())
      reset({
        nombre: "",
        cantidad: 0,
        presentacion: "Kilogramos",
        valor: 0,
        fechaIngreso: fechaHoy,
      })
      setFechaSeleccionada(fechaHoy)
    }
  }, [activeId, insumos, setValue, reset])

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFecha = e.target.value
    console.log("Fecha seleccionada en el input:", nuevaFecha)
    setFechaSeleccionada(nuevaFecha)
    setValue("fechaIngreso", nuevaFecha)
  }

  const onSubmit = async (data: DraftInsumo) => {
    try {
      const formattedData: DraftInsumo = {
        ...data,
        cantidad: typeof data.cantidad === "string" ? Number.parseFloat(data.cantidad) : data.cantidad,
        valor: typeof data.valor === "string" ? Number.parseFloat(data.valor) : data.valor,
        fechaIngreso: fechaSeleccionada,
      }

      console.log("Datos del formulario antes de enviar:", formattedData)

      if (activeId) {
        await updateInsumo(formattedData)
        toast.success("Insumo actualizado correctamente")
      } else {
        await addInsumo(formattedData)
        toast.success("Insumo agregado correctamente")
      }
      closeModal()
      reset()
    } catch (error) {
      console.error("Error en el formulario:", error)
      toast.error("Error al procesar el formulario. Por favor, inténtalo de nuevo.")
    }
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-center w-full">{activeId ? "EDITAR INSUMO" : "NUEVO INSUMO"}</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Nombre del Insumo</label>
            <input
              type="text"
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              placeholder="Ingrese el nombre del insumo"
              {...register("nombre", { required: "El nombre del insumo es obligatorio" })}
            />
            {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Cantidad</label>
            <input
              type="number"
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              min="0"
              step="0.01"
              {...register("cantidad", {
                required: "La cantidad es obligatoria",
                valueAsNumber: true,
              })}
            />
            {errors.cantidad && <span className="text-red-500 text-sm">{errors.cantidad.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Presentación</label>
            <select
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              {...register("presentacion", { required: "La presentación es obligatoria" })}
            >
              {presentaciones.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.presentacion && <span className="text-red-500 text-sm">{errors.presentacion.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Valor</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <input
                type="number"
                className="w-full p-2 pl-6 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
                min="0"
                step="0.01"
                {...register("valor", {
                  required: "El valor es obligatorio",
                  valueAsNumber: true,
                })}
              />
            </div>
            {errors.valor && <span className="text-red-500 text-sm">{errors.valor.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Fecha</label>
            <input
              type="date"
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              value={fechaSeleccionada}
              onChange={handleFechaChange}
            />
            {errors.fechaIngreso && <span className="text-red-500 text-sm">{errors.fechaIngreso.message}</span>}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : activeId ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InsumoModal