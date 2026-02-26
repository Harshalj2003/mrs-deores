import axios from "axios";
import { API_BASE } from "../config";

const API_URL = (API_BASE || "") + "/api/";

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(
    (config) => {
        // Auth token injection
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers["Authorization"] = 'Bearer ' + user.token;
            }
        }

        // Auto-detect FormData and let browser set correct multipart boundary
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Global handler for invalid/expired tokens
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized request detected. Token may be expired or invalid. Logging out...");
            localStorage.removeItem("user");

            // Only redirect if not already on login/signup to avoid loops
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
