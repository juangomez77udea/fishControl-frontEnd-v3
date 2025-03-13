import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useInsumoStore } from "../../store/useInsumoStore";
import type { DraftInsumo, InsumoType, Stage } from "../../types/insumo";

// Definir las opciones de presentación, tipo de insumo y etapas
const presentaciones = ["40kg", "20kg", "Kilogramos", "Gramo", "Litro", "Mililitro", "Unidad", "Caja", "Paquete"];
const tiposInsumo: InsumoType[] = ["FOOD", "MEDICINE", "EQUIPMENT", "PACKAGING", "DISINFECTANT", "OTHER"];
const etapas: Stage[] = ["cría", "destete", "levante", "engorde"];

const InsumoModal: React.FC = () => {
  const { isModalOpen, closeModal, addInsumo, updateInsumo, activeId, insumos, isLoading } = useInsumoStore();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<DraftInsumo>();

  // Observar el valor del campo "type" para mostrar/ocultar el campo "stage"
  const tipoSeleccionado = watch("type");

  // Estado local para la fecha
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().split("T")[0]);

  // Efecto para cargar datos cuando se edita un insumo
  useEffect(() => {
    if (activeId) {
      const insumoToEdit = insumos.find((i) => i.id === activeId);
      if (insumoToEdit) {
        setValue("nombre", insumoToEdit.nombre);
        setValue("cantidad", insumoToEdit.cantidad);
        setValue("presentacion", insumoToEdit.presentacion);
        setValue("valor", insumoToEdit.valor);
        setValue("type", insumoToEdit.type);
        setValue("stage", insumoToEdit.stage);
        setValue("fechaIngreso", insumoToEdit.fechaIngreso);
        setFechaSeleccionada(insumoToEdit.fechaIngreso);
      }
    } else {
      // Valores por defecto para un nuevo insumo
      reset({
        nombre: "",
        cantidad: 0,
        presentacion: "40kg",
        valor: 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
        type: "FOOD", // Tipo por defecto
        stage: "cría", // Etapa por defecto
      });
      setFechaSeleccionada(new Date().toISOString().split("T")[0]);
    }
  }, [activeId, insumos, setValue, reset]);

  // Función para manejar el envío del formulario
  const onSubmit = async (data: DraftInsumo) => {
    try {
      const formattedData: DraftInsumo = {
        ...data,
        cantidad: typeof data.cantidad === "string" ? Number.parseFloat(data.cantidad) : data.cantidad,
        valor: typeof data.valor === "string" ? Number.parseFloat(data.valor) : data.valor,
        fechaIngreso: fechaSeleccionada,
      };

      if (activeId) {
        await updateInsumo(formattedData);
        toast.success("Insumo actualizado correctamente");
      } else {
        await addInsumo(formattedData);
        toast.success("Insumo agregado correctamente");
      }
      closeModal();
      reset();
    } catch (error) {
      console.error("Error en el formulario:", error);
      toast.error("Error al procesar el formulario. Por favor, inténtalo de nuevo.");
    }
  };

  if (!isModalOpen) return null;

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
          {/* Campo: Nombre del Insumo */}
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

          {/* Campo: Tipo de Insumo */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Tipo de Insumo</label>
            <select
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              {...register("type", { required: "El tipo de insumo es obligatorio" })}
            >
              {tiposInsumo.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
          </div>

          {/* Campo: Etapa (solo para alimentos) */}
          {tipoSeleccionado === "FOOD" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Etapa</label>
              <select
                className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
                {...register("stage", { required: "La etapa es obligatoria para alimentos" })}
              >
                {etapas.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
              {errors.stage && <span className="text-red-500 text-sm">{errors.stage.message}</span>}
            </div>
          )}

          {/* Campo: Presentación */}
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

          {/* Campo: Cantidad */}
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

          {/* Campo: Valor */}
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

          {/* Campo: Fecha */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Fecha</label>
            <input
              type="date"
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              {...register("fechaIngreso", { required: "La fecha es obligatoria" })}
            />
            {errors.fechaIngreso && <span className="text-red-500 text-sm">{errors.fechaIngreso.message}</span>}
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : activeId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsumoModal;