import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { User } from "../types/user"
import { getAllUsers, toggleUserStatus, deleteUser } from "../api/userApi"

type UserState = {
  users: User[]
  isLoading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  enableUser: (id: number) => Promise<void>
  disableUser: (id: number) => Promise<void>
  removeUser: (id: number) => Promise<void>
}

export const useUserStore = create<UserState>()(
  devtools((set) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
      try {
        set({ isLoading: true, error: null })
        const users = await getAllUsers()
        set({ users, isLoading: false })
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        set({
          isLoading: false,
          error: "Error al cargar usuarios. Por favor, inténtalo de nuevo.",
        })
      }
    },

    enableUser: async (id: number) => {
      try {
        set({ isLoading: true, error: null })
        await toggleUserStatus(id, true)
        // Actualizar el estado local
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, enabled: true } : user)),
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error al activar usuario:", error)
        set({
          isLoading: false,
          error: "Error al activar usuario. Por favor, inténtalo de nuevo.",
        })
        throw error
      }
    },

    disableUser: async (id: number) => {
      try {
        set({ isLoading: true, error: null })
        await toggleUserStatus(id, false)
        // Actualizar el estado local
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, enabled: false } : user)),
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error al desactivar usuario:", error)
        set({
          isLoading: false,
          error: "Error al desactivar usuario. Por favor, inténtalo de nuevo.",
        })
        throw error
      }
    },

    removeUser: async (id: number) => {
      try {
        set({ isLoading: true, error: null })
        await deleteUser(id)
        // Eliminar el usuario del estado local
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          isLoading: false,
        }))
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        set({
          isLoading: false,
          error: "Error al eliminar usuario. Por favor, inténtalo de nuevo.",
        })
        throw error
      }
    },
  })),
)

