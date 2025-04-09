import type { UserRole } from "./Auth"

// Tipo para representar un rol de usuario
export type Role = {
  id?: number
  name: string
}

// Tipo para representar un usuario en el frontend
export type User = {
  id: number
  username: string
  email: string
  enabled: boolean
  roles: Role[] | UserRole[] | string[]
}


export type UsersResponse = User[]

