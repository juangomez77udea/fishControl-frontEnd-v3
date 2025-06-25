import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const PRODUCT_API_URL = "http://localhost:7777/api/products/api";

export const productApiInstance: AxiosInstance = axios.create({
    baseURL: PRODUCT_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar el token de autenticación a cada petición
productApiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);