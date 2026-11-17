import axiosInstance from "../../../config/axios/axiosinstance";
import type { GetTasksResponse, Task } from "../interfaces/Task";

type TaskPayload = {
    nom: string;
    description: string;
    date_debut: string;
    date_fin: string;
    projet_id: number;
    user_id: number | null;
};

type TaskResponse = {
    data: Task;
    message: string;
    statut: number;
};

type BranchResponse = {
    data: { branch: string; url: string };
    message: string;
    statut: number;
};

const getTasks = async (): Promise<GetTasksResponse> => {
    const response = await axiosInstance({ url: "/taches", method: "GET" });
    return response.data;
};

const createTask = async (task: TaskPayload): Promise<TaskResponse> => {
    const response = await axiosInstance({ url: "/taches", method: "POST", data: task });
    return response.data;
};

const updateTask = async (taskId: number, task: TaskPayload): Promise<TaskResponse> => {
    const response = await axiosInstance({ url: `/taches/${taskId}`, method: "PUT", data: task });
    return response.data;
};

const deleteTask = async (taskId: number): Promise<void> => {
    await axiosInstance({ url: `/taches/${taskId}`, method: "DELETE" });
};

const takeTask = async (taskId: number): Promise<TaskResponse> => {
    const response = await axiosInstance({ url: `/taches/${taskId}/take`, method: "POST" });
    return response.data;
};

const startTask = async (taskId: number): Promise<TaskResponse> => {
    const response = await axiosInstance({ url: `/taches/${taskId}/start`, method: "POST" });
    return response.data;
};

const createTaskBranch = async (taskId: number): Promise<BranchResponse> => {
    const response = await axiosInstance({ url: `/taches/${taskId}/branch`, method: "POST" });
    return response.data;
};

export type { TaskPayload };
export { createTask, createTaskBranch, deleteTask, getTasks, startTask, takeTask, updateTask };
