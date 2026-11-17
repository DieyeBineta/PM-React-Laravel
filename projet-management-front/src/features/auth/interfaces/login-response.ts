import type { User } from "./user";

export interface LoginResponse {
    message: string;
    token: string;
    must_change_password: boolean; 
    user: User;
}