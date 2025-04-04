import type { AxiosError } from "axios"

// Tipo para las respuestas de error del backend
export type ApiErrorResponse = {
  status?: number
  error?: string
  message?: string
  path?: string
}

export type ApiError = AxiosError<ApiErrorResponse>

