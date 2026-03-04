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
        // CRITICAL: Exclude auth endpoints from the 401 redirect.
        // A failed login attempt returns 401 (Bad credentials) from /api/auth/signin.
        // If we redirect on that, we create an infinite redirect loop that prevents any login.
        const requestUrl: string = error.config?.url ?? "";
        const isAuthEndpoint = requestUrl.includes("auth/");

        // Don't auto-logout admin users for user-facing endpoint 401s (e.g. /cart, /wishlist)
        // These endpoints will naturally 401 for admins since they don't exist in the users table
        const userStr = localStorage.getItem("user");
        let isAdmin = false;
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                isAdmin = user?.roles?.includes("ROLE_ADMIN");
            } catch { /* malformed — will be caught below */ }
        }

        // User-facing endpoints that admins don't use — never wipe admin sessions for these
        const userOnlyEndpoints = ["/cart", "/wishlist", "/orders", "/addresses"];
        const isUserOnlyEndpoint = userOnlyEndpoints.some(ep => requestUrl.includes(ep));

        if (error.response && error.response.status === 401 && !isAuthEndpoint) {
            // If admin hits a user-only endpoint with 401, just silently ignore
            if (isAdmin && isUserOnlyEndpoint) {
                return Promise.reject(error);
            }

            // GUEST users (not logged in): Never redirect to login.
            // They may trigger 401s from background /cart, /wishlist sync — that's normal.
            if (!userStr) {
                return Promise.reject(error);
            }

            console.warn("Unauthorized request (non-auth). Token expired or invalid. Logging out...");
            localStorage.removeItem("user");

            // Redirect to login only if not already on auth pages
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
