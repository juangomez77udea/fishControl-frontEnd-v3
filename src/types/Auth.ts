import type { AxiosError } from "axios"

// Tipo para las respuestas de error del backend
export type ApiErrorResponse = {
  status?: number
  error?: string
  message?: string
  path?: string
}

export type ApiError = AxiosError<ApiErrorResponse>

// Tipos de roles de usuario
export type UserRole = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_GUEST" | "ROLE_INVITED"

// Tipo para la información del usuario autenticado
export type AuthUser = {
  username: string
  roles: UserRole[]
  token: string
  refreshToken: string
}

// Tipo para la respuesta de autenticación del backend
export type AuthResponse = {
  token: string
  refreshToken: string
  message: string
  username: string
  roles: string[]
}