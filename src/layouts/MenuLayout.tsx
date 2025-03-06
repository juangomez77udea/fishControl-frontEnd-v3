import { type FC, type ReactNode, useState, useEffect, useCallback } from "react"
import Header from "../components/header/Header"
import { useNavigate } from "react-router-dom"

type MenuLayoutProps = {
  children: ReactNode
}

const MenuLayout: FC<MenuLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si el usuario está autenticado al montar el componente
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    } else {
      setIsMounted(true)
    }
  }, [navigate])

  const handleLogout = useCallback(() => {
    // Eliminar el token del localStorage
    localStorage.removeItem("token")
    // Redirigir al login
    navigate("/")
  }, [navigate])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onLogout={handleLogout} />
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}

export default MenuLayout

