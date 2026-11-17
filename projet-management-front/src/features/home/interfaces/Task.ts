import type { Project } from "./Project";
import type { User } from "../../auth/interfaces/user";

export type TaskStatus = "Disponible" | "Attribuée" | "En cours" | "Terminé";

export interface Task {
    id: number;
    nom: string;
    description: string | null;
    date_debut: string | null;
    date_fin: string | null;
    statut: TaskStatus;
    projet_id: number;
    user_id: number | null;
    created_at?: string;
    github_branch?: string | null;
    github_branch_url?: string | null;
    projet?: Project;
    user?: User | null;
}

export interface GetTasksResponse {
    data: Task[];
    message: string;
    statut: number;
}
