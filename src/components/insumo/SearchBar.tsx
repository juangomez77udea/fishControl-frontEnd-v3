"use client"

import { useState, type FC, type FormEvent, type ChangeEvent } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

type SearchBarProps = {
  onSearchResults: (searchTerm: string) => void
  onResetSearch: () => void
  isLoading?: boolean
  className?: string
  placeholder?: string
}

const SearchBar: FC<SearchBarProps> = ({
  onSearchResults,
  onResetSearch,
  isLoading = false,
  className = "",
  placeholder = "Buscar insumos por nombre...",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Manejar cambios en el campo de búsqueda
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Manejar el envío del formulario de búsqueda
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSearchResults(searchTerm)
  }

  // Limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchTerm("")
    onResetSearch()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className=" text-slate-500 w-full p-2 pr-10 bg-blue-30 border border-blue-100 rounded-lg focus:outline-none focus:border-blue-300"
          disabled={isLoading}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Limpiar búsqueda"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center h-[38px]"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaSearch className="text-xs" />
        )}
      </button>
    </form>
  )
}

export default SearchBar
