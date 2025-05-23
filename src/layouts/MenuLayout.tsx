import { type FC, type ReactNode, useState, useEffect, useCallback } from "react"
import Header from "../components/header/Header"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { decodeJwt } from "../utils/jwt"
import type { UserRole } from "../types/Auth"

type MenuLayoutProps = {
  children: ReactNode
}

const MenuLayout: FC<MenuLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()
  const clearUser = useAuthStore((state) => state.clearUser)
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
    } else {
      // Si hay un token pero no hay roles en el store (o el array está vacío),
      // decodificar el token y actualizar los roles
      if (!user || !user.roles || user.roles.length === 0) {
        const decodedToken = decodeJwt(token)
        console.log("Token decodificado en MenuLayout:", decodedToken)
        
        if (decodedToken && decodedToken.roles) {
          const rolesFromToken = decodedToken.roles as UserRole[]
          console.log("Roles obtenidos del token en MenuLayout:", rolesFromToken)
          
          // Actualizar el usuario en el store con los roles del token
          setUser({
            username: typeof decodedToken.sub === "string" ? decodedToken.sub : "",
            roles: rolesFromToken,
            token: token,
            refreshToken: user?.refreshToken || "",
          })
        }
      }
      
      setIsMounted(true)
    }
  }, [navigate, setUser, user])

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