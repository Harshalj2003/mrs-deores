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

const verifyEmail = (email: string, otp: string) => {
    return api.post("auth/verify-email", { email, otp }).then((response) => {
        // Update stored user if successfully verified
        const user = getCurrentUser();
        if (user && user.email === email) {
            user.isEmailVerified = true;
            localStorage.setItem("user", JSON.stringify(user));
        }
        return response.data;
    });
};

const resendOtp = (email: string) => {
    return api.post("auth/resend-otp", { email });
};

const AuthService = {
    login,
    logout,
    register,
    adminRegister,
    getCurrentUser,
    verifyEmail,
    resendOtp,
};

export default AuthService;
