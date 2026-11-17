import type { changePasswordRequest } from "../interfaces/change-password-request"
import type { loginRequest } from "../interfaces/login-request"
import axiosInstance from "../../../config/axios/axiosinstance"

const login = async (loginRequest: loginRequest) => {
    // const response = await fetch(`${apiBaseUrl}/login`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application:json",
    //     },
    //     body: JSON.stringify(loginRequest)
    // })

    const response = await axiosInstance({url: '/login', method: "POST", data: loginRequest})
    return response.data
}

const changePassword = async (changePasswordRequest: changePasswordRequest) => {
    // console.log(getToken())
    // const response = await fetch(`${apiBaseUrl}/password/change`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         Authorization : `Bearer ${localStorage.getItem("token")}`
    //     },
    //     body: JSON.stringify(changePasswordRequest),
    // })
    const response = await axiosInstance({url: '/password/change', method: "POST", data: changePasswordRequest})

    if(!response) throw new Error("Changement de mot de passe échoué")

    return response.data
}
const logout = async () => {
    const response = await axiosInstance({ url: "/logout", method: "POST" });
    return response.data;
}
const signup = () => {}

export { login, signup, changePassword, logout }