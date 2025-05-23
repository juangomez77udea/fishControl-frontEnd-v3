import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"

const SUPPLY_API_URL = "http://localhost:7777/SUPPLY-SERVICE/api"

export const supplyApi: AxiosInstance = axios.create({
  baseURL: SUPPLY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

supplyApi.interceptors.request.use(
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
  }
)
