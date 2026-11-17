import axiosInstance from "../../../config/axios/axiosinstance";
// import type { GetUserRequest } from "../interfaces/GetUserRequest";

const getUser = async () => {
    const response = await axiosInstance({url: '/user', method: 'GET'})
    return response.data;
}

export { getUser }