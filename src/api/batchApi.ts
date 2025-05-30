// Asumiendo que este es tu archivo para batchApi, por ejemplo, batchServiceApi.ts o dentro de api.ts

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";


const BATCH_API_GATEWAY_URL = "http://localhost:7777/api";

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