"use client"

import { type FC, type ReactNode, useState, useEffect, useCallback } from "react"
import Header from "../components/header/Header"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"

type MenuLayoutProps = {
  children: ReactNode
}

const MenuLayout: FC<MenuLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()
  const clearUser = useAuthStore((state) => state.clearUser)

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
    // Limpiar el estado de autenticación
    clearUser()
    // Redirigir al login
    navigate("/")
  }, [navigate, clearUser])

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

