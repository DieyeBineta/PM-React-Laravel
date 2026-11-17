export interface User{
    id: number;
    name: string;
    email: string;
    role_id: number;
    role?: {
        id: number;
        titre: string;
    };
    statut?: "Actif" | "Desactivé";
    projets?: Array<{
        id: number;
        nom: string;
    }>;
}