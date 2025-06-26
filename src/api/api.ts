import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import type { AuthResponse } from "../types/Auth"

const API_URL: string = "http://localhost:7777/user-service/api"

// Función para iniciar sesión
export const login = async (username: string, password: string): Promise<AuthResponse | null> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, { username, password })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error en login:", error.response ? error.response.data : error.message)
      console.error("Status code:", error.response ? error.response.status : "No status")
      console.error("Headers:", error.response ? error.response.headers : "No headers")
    } else {
      console.error("Error desconocido en login:", error)
    }
    throw error;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token en cada petición
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  },
)