export interface User {
    id: number;
    email: string;
    username: string;
    age: number;
    hasCompletedSetup: boolean;
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    token: string;
    user: User;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}