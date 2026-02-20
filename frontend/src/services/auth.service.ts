import api from "./api";
import type { LoginRequest, RegisterRequest } from "../types/auth.types";

const login = (data: LoginRequest) => {
    return api
        .post("auth/signin", data)
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const register = (data: RegisterRequest) => {
    return api.post("auth/signup", data);
};

export interface AdminRegisterData {
    username: string;
    email: string;
    phone: string;
    password: string;
    inviteToken: string;
}

const adminRegister = (data: AdminRegisterData) => {
    return api.post("auth/admin/register", data);
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
};

const AuthService = {
    login,
    logout,
    register,
    adminRegister,
    getCurrentUser,
};

export default AuthService;
