export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    token: string;
    isEmailVerified?: boolean;
}

export interface LoginRequest {
    username?: string;
    password?: string;
    isAdmin?: boolean;
    inviteToken?: string;
}

export interface RegisterRequest {
    username?: string;
    email?: string;
    password?: string;
    role?: string[];
}
