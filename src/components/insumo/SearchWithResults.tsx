import type React from "react"
import { useState } from "react"
import SearchBar from "./SearchBar"
import SearchResultsModal from "./SearchResultsModal"
import type { Insumo } from "../../types/insumo"
import { insumoService } from "../../service/InsumoService"
import { toast } from "react-toastify"

type SearchWithResultsProps = {
  className?: string
}

const SearchWithResults: React.FC<SearchWithResultsProps> = ({ className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Insumo[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ===== INICIO DE LA MODIFICACIÓN =====
  const handleSearchResults = async (term: string) => {
    const trimmedTerm = term.trim()
    if (!trimmedTerm) {
      toast.info("Ingresa un término de búsqueda")
      return
    }

    try {
      setIsLoading(true)
      
      const allInsumos = await insumoService.getAll() 
      const lowercasedTerm = trimmedTerm.toLowerCase()
      const results = allInsumos.filter(insumo => 
        insumo.nombre.toLowerCase().includes(lowercasedTerm)
      )

      setSearchResults(results)
      setSearchTerm(trimmedTerm)
      setIsModalOpen(true)

      if (results.length === 0) {
        toast.info(`No se encontraron insumos que coincidan con "${trimmedTerm}"`)
      } else {
        toast.success(`Se encontraron ${results.length} insumo(s)`)
      }

    } catch (error) {
      console.error("Error al obtener o buscar insumos:", error)
      toast.error("Error al buscar insumos. Por favor, inténtalo de nuevo.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }


  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleResetSearch = () => {
    setSearchResults([])
    setSearchTerm("")
  }

  return (
    <div className={className}>
      <SearchBar onSearchResults={handleSearchResults} onResetSearch={handleResetSearch} isLoading={isLoading} />

      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        results={searchResults}
        searchTerm={searchTerm}
      />
    </div>
  )
}

export default SearchWithResults