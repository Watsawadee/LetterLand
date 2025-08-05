export interface CreateUserRequest {
    email: string;
    username: string;
    password: string;
}

export interface CreateUserResponse {
    message: string;
    user: {
        id: number;
        email: string;
        username: string;
        password: string;
        age: number;
        englishLevel: string;
        coin: number;
        hint: number;
        created_at: string | Date;
        total_playtime: number;
    };
    token: string;
}