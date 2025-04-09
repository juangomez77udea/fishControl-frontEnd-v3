import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

type PrivateRouteProps = {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token")

  if (!token) {
    // Redirigir al usuario a la página de inicio de sesión si no está autenticado
    return <Navigate to="/" />
  }

  // Si el usuario está autenticado, mostrar el contenido protegido
  return <>{children}</>
}

export default PrivateRoute

