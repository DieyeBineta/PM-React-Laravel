import type { User } from "../../auth/interfaces/user";

export interface GetUserResponse {
    data: User[];
    message: string;
    statut: number;
}