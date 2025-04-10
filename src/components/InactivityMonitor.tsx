import type React from "react"

import { useEffect } from "react"
import { useInactivityTimeout } from "../hooks/useInactivityTimeout"
import { useAuthStore } from "../store/useAuthStore"

type InactivityMonitorProps = {
  children: React.ReactNode
}

const InactivityMonitor: React.FC<InactivityMonitorProps> = ({ children }) => {
  const { resetTimer } = useInactivityTimeout()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Reiniciar el temporizador cuando cambia el estado de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      resetTimer()
    }
  }, [isAuthenticated, resetTimer])

  return <>{children}</>
}

export default InactivityMonitor
