import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { AuthUser, UserRole } from "../types/Auth"

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: true,
          }),

        clearUser: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),

        hasRole: (role) => {
          const { user } = get()
          if (!user) return false
          return user.roles.includes(role)
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      },
    ),
  ),
)