import axiosInstance from "../../../config/axios/axiosinstance";
import type { CreateUserRequest } from "../interfaces/CreateUserRequest";
import type { GetUserResponse } from "../interfaces/GetUserResponse";
import type { User } from "../../auth/interfaces/user";

const createUser = async (createUserRequest: CreateUserRequest): Promise<{ data: User }> => {
    const response = await axiosInstance({url: '/users', method: "POST", data: createUserRequest})
    return response.data
}

const updateUser = async (
    userId: number,
    user: Pick<User, "name" | "email" | "role_id">
): Promise<{ data: User }> => {
    const response = await axiosInstance({ url: `/users/${userId}`, method: "PUT", data: user });
    return response.data;
}

const getUsers = async (): Promise<GetUserResponse> => {
    const response = await axiosInstance({url: '/users', method: "GET"})
    return response.data
}

const setUserActiveStatus = async (userId: number, active: boolean): Promise<{ data: User }> => {
    const action = active ? "activer" : "desactiver";
    const response = await axiosInstance({
        url: `/users/${userId}/${action}`,
        method: "PATCH",
    });
    return response.data;
}


export { createUser, getUsers, setUserActiveStatus, updateUser }