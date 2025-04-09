import { api } from "./api"
import type { User, UsersResponse } from "../types/user"

// Función para obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<UsersResponse>("/users")
    return response.data
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    throw error
  }
}

// Función para habilitar/deshabilitar un usuario
export const toggleUserStatus = async (id: number, enable: boolean): Promise<void> => {
  try {
    const endpoint = enable ? `/enableUser/${id}` : `/disableUser/${id}`
    await api.patch(endpoint)
  } catch (error) {
    console.error(`Error al ${enable ? "activar" : "desactivar"} usuario:`, error)
    throw error
  }
}

// Función para eliminar un usuario
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/deleteUser/${id}`)
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    throw error
  }
}

