// Tipos de roles de usuario
export type UserRole = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_GUEST"

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

