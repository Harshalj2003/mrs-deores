export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    token: string;
    isEmailVerified?: boolean;
    phone?: string;
    fullName?: string;
    bio?: string;
    profilePicUrl?: string;
    createdAt?: string;
    lastLoginAt?: string;
    accountStatus?: string;
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
