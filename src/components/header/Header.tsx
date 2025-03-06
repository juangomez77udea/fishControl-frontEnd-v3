import { type FC, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FaBoxOpen, FaBoxes, FaChartLine, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"
import { PiFishSimpleBold } from "react-icons/pi"
import type { NavItem } from "../../types/navigation"

type HeaderProps = {
  onLogout?: () => void
}

const Header: FC<HeaderProps> = ({ onLogout }) => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      title: "INSUMOS",
      path: "/insumos",
      icon: <FaBoxOpen className="text-xl" />,
    },
    {
      title: "CULTIVO",
      path: "/cultivo",
      icon: <PiFishSimpleBold className="text-xl text-bold" />,
    },
    {
      title: "PRODUCTO",
      path: "/producto",
      icon: <FaBoxes className="text-xl" />,
    },
    {
      title: "ESTADÍSTICAS",
      path: "/estadisticas",
      icon: <FaChartLine className="text-xl" />,
    },
  ]

  const isActive = (path: string) => location.pathname === path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-blue-950 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src="/images/logo2.png" alt="Fish Control Logo" className="h-12 md:h-16" />
        </div>

        {/* Botón de menú hamburguesa (visible solo en móvil) */}
        <button
          className="md:hidden text-white p-2"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Navegación para pantallas medianas y grandes */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-md w-20 lg:w-24 h-14 lg:h-16 transition-colors ${isActive(item.path) ? "bg-green-500 text-white" : "bg-green-500 text-white hover:bg-green-600"
                }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center p-2 rounded-md w-20 lg:w-24 h-14 lg:h-16 bg-green-500 text-white hover:bg-green-600 transition-colors ml-2"
          >
            <div className="mb-1">
              <FaSignOutAlt className="text-xl" />
            </div>
            <span className="text-xs font-medium">SALIR</span>
          </button>
        </div>
      </div>

      {/* Menú móvil (visible solo cuando está abierto) */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4 pb-2">
          <div className="grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-md h-16 transition-colors ${isActive(item.path) ? "bg-green-500 text-white" : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="mb-1">{item.icon}</div>
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            ))}

            <button
              onClick={() => {
                if (onLogout) onLogout()
                setIsMenuOpen(false)
              }}
              className="flex flex-col items-center justify-center p-2 rounded-md h-16 bg-green-500 text-white hover:bg-green-600 transition-colors col-span-2"
            >
              <div className="mb-1">
                <FaSignOutAlt className="text-xl" />
              </div>
              <span className="text-xs font-medium">SALIR</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header

