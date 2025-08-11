export interface LoginRequestBody {
    email: string;
    password: string;
}
export interface LoginResponse {
    message: string;
    token: string;
    user: {
        age: number;
        englishLevel: string;
        coin: number;
        hint: number;
        created_at: string;
        total_playtime: number;
    };
}
