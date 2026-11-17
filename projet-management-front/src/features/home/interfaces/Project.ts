import type { User } from "../../auth/interfaces/user";
import type { Task } from "./Task";

export interface Project {
    id: number;
    nom: string;
    description: string | null;
    lead_developpeur_id?: number;
    lead_developpeur?: User;
    users_count?: number;
    users?: User[];
    taches_min_date_debut?: string | null;
    taches_max_date_fin?: string | null;
    taches?: Task[];
}

export interface GetProjectsResponse {
    data: Project[];
    message: string;
    statut: number;
}

export interface GetProjectResponse {
    data: Project;
    message: string;
    statut: number;
}

export interface CreateProjectRequest {
    nom: string;
    description?: string;
    lead_developpeur_id: number;
    developer_ids: number[];
}
