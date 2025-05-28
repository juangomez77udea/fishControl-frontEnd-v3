// Asumiendo que este es tu archivo para batchApi, por ejemplo, batchServiceApi.ts o dentro de api.ts

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// Esta es la URL base CORRECTA para acceder a batch-service a través del Gateway
const BATCH_API_GATEWAY_URL = "http://localhost:7777/api"; // El /api/batches se añadirá después

export const batchApiInstance: AxiosInstance = axios.create({
    baseURL: BATCH_API_GATEWAY_URL, // Usamos la URL base del gateway, luego las rutas específicas
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor CORRECTO para batchApiInstance
batchApiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Batch API Request Config:', config); // Para depuración
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);