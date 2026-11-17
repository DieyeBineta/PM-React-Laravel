import axiosInstance from "../../../config/axios/axiosinstance";
import type {
    CreateProjectRequest,
    GetProjectResponse,
    GetProjectsResponse,
} from "../interfaces/Project";

const getProjects = async (): Promise<GetProjectsResponse> => {
    const response = await axiosInstance({ url: "/projets", method: "GET" });
    return response.data;
};

const getProject = async (projectId: number): Promise<GetProjectResponse> => {
    const response = await axiosInstance({ url: `/projets/${projectId}`, method: "GET" });
    return response.data;
};

const createProject = async (project: CreateProjectRequest): Promise<GetProjectResponse> => {
    const response = await axiosInstance({ url: "/projets", method: "POST", data: project });
    return response.data;
};

const updateProject = async (
    projectId: number,
    project: Omit<CreateProjectRequest, "developer_ids">
): Promise<GetProjectResponse> => {
    const response = await axiosInstance({ url: `/projets/${projectId}`, method: "PUT", data: project });
    return response.data;
};

const deleteProject = async (projectId: number): Promise<void> => {
    await axiosInstance({ url: `/projets/${projectId}`, method: "DELETE" });
};

export { createProject, deleteProject, getProject, getProjects, updateProject };
