// src/types/decodedToken.ts
export interface DecodedToken {
    userId: number;
    username: string;
    email: string;
    hasCompletedSetup: boolean;
    iat: number;
    exp: number;
}
