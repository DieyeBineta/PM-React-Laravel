export interface CreateUserRequest {
    name: string;
    email: string;
    password?: string;
    password_confirmation: string;
    role_id: number;
}