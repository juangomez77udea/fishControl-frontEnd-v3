import { useEffect, useRef, useCallback } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

// Tiempo de inactividad en milisegundos (10 minutos)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000

export const useInactivityTimeout = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearUser = useAuthStore((state) => state.clearUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  // Función para realizar el logout
  const handleLogout = useCallback(() => {
    if (isAuthenticated) {
      // Limpiar el token del localStorage
      localStorage.removeItem("token")
      // Limpiar el estado de autenticación
      clearUser()
      // Mostrar mensaje al usuario
      toast.info("Sesión cerrada por inactividad", { theme: "dark" })
      // Redirigir al login
      navigate("/")
    }
  }, [clearUser, navigate, isAuthenticated])

  // Función para reiniciar el temporizador
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Solo configurar el temporizador si el usuario está autenticado
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        handleLogout()
      }, INACTIVITY_TIMEOUT)
    }
  }, [handleLogout, isAuthenticated])

  // Configurar los event listeners para detectar actividad del usuario
  useEffect(() => {
    // Solo configurar los event listeners si el usuario está autenticado
    if (!isAuthenticated) return

    // Lista de eventos que reinician el temporizador
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    // Iniciar el temporizador
    resetTimer()

    // Agregar event listeners
    const eventListeners = events.map((event) => {
      const listener = () => resetTimer()
      window.addEventListener(event, listener)
      return { event, listener }
    })

    // Limpiar event listeners y temporizador al desmontar
    return () => {
      eventListeners.forEach(({ event, listener }) => {
        window.removeEventListener(event, listener)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [resetTimer, isAuthenticated])

  return { resetTimer }
}
