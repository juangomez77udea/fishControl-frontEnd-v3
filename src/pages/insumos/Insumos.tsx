import type React from "react";
import { useEffect } from "react";
import { useInsumoStore } from "../../store/useInsumoStore";
import InsumoTable from "../../components/insumo/InsumoTable";
import InsumoModal from "../../components/insumo/InsumoModal";
import AddInsumoButton from "../../components/insumo/AddInsumoButton";

const Insumos: React.FC = () => {
  const { fetchInsumos, isLoading } = useInsumoStore();

  // Cargar los insumos al montar el componente
  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Insumos</h1>

      {/* Mostrar un spinner si está cargando */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-6">
          {/* Renderizar la tabla de insumos */}
          <InsumoTable />
        </div>
      )}

      {/* Renderizar el modal y el botón para agregar insumos */}
      <InsumoModal />
      <AddInsumoButton />
    </div>
  );
};

export default Insumos;