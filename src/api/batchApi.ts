import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const BATCH_API_GATEWAY_URL = "http://localhost:7777/api";

export const batchApiInstance: AxiosInstance = axios.create({
    baseURL: BATCH_API_GATEWAY_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para batchApiInstance
batchApiInstance.interceptors.request.use(
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