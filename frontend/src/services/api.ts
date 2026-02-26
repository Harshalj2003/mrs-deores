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
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers["Authorization"] = 'Bearer ' + user.token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
