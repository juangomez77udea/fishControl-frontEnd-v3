import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useInsumoStore } from "../../store/useInsumoStore";
import type { DraftInsumo } from "../../types/insumo";

const presentaciones = ["Kilogramo", "Gramo", "Litro", "Mililitro", "Unidad", "Caja", "Paquete"];

const InsumoModal: React.FC = () => {
  const { isModalOpen, closeModal, addInsumo, updateInsumo, activeId, insumos } = useInsumoStore();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<DraftInsumo>();

  // Cargar datos si estamos editando un insumo existente
  useEffect(() => {
    if (activeId) {
      const insumoToEdit = insumos.find((i) => i.id === activeId);
      if (insumoToEdit) {
        setValue("nombre", insumoToEdit.nombre);
        setValue("cantidad", insumoToEdit.cantidad);
        setValue("presentacion", insumoToEdit.presentacion);
        setValue("valor", insumoToEdit.valor);
        setValue("fechaIngreso", insumoToEdit.fechaIngreso);
      }
    } else {
      reset({
        nombre: "",
        cantidad: 0,
        presentacion: "Kilogramo",
        valor: 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
      });
    }
  }, [activeId, insumos, setValue, reset]);

  const onSubmit = (data: DraftInsumo) => {
    if (activeId) {
      updateInsumo(data);
      toast.success("Insumo actualizado correctamente");
    } else {
      addInsumo(data);
      toast.success("Insumo agregado correctamente");
    }
    closeModal();
    reset();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-center w-full">NUEVO INSUMO</h2>
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
              {...register("cantidad", { required: "La cantidad es obligatoria" })}
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
                {...register("valor", { required: "El valor es obligatorio" })}
              />
            </div>
            {errors.valor && <span className="text-red-500 text-sm">{errors.valor.message}</span>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Fecha</label>
            <input
              type="date"
              className="w-full p-2 bg-blue-100 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
              {...register("fechaIngreso", { required: "La fecha de ingreso es obligatoria" })}
            />
            {errors.fechaIngreso && <span className="text-red-500 text-sm">{errors.fechaIngreso.message}</span>}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {activeId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsumoModal;