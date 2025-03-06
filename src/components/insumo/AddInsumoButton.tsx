import type React from "react"
import { FaPlus } from "react-icons/fa"
import { useInsumoStore } from "../../store/useInsumoStore"

const AddInsumoButton: React.FC = () => {
  const { openModal } = useInsumoStore()

  return (
    <button
      onClick={openModal}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors z-10"
      aria-label="Agregar insumo"
    >
      <FaPlus className="text-xl" />
    </button>
  )
}

export default AddInsumoButton

