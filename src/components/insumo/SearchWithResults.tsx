"use client"

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

  // Manejar los resultados de búsqueda
  const handleSearchResults = async (term: string) => {
    if (!term.trim()) {
      toast.info("Ingresa un término de búsqueda")
      return
    }

    try {
      setIsLoading(true)
      const results = await insumoService.searchByName(term.trim())

      setSearchResults(results)
      setSearchTerm(term.trim())
      setIsModalOpen(true)

      // Mostrar mensaje según los resultados
      if (results.length === 0) {
        toast.info(`No se encontraron insumos con el nombre "${term}"`)
      } else {
        toast.success(`Se encontraron ${results.length} insumo(s)`)
      }
    } catch (error) {
      console.error("Error al buscar insumos:", error)
      toast.error("Error al buscar insumos. Por favor, inténtalo de nuevo.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Manejar el reseteo de la búsqueda
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
