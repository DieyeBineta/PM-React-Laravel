import axios from "axios";
import { apiBaseUrl } from "../api";
import { getToken, removeToken } from "../../commons/services/tokenService";
import { isApiUrlWhiteListed } from "../../utils/tools";

const axiosInstance = axios.create({
    baseURL: apiBaseUrl,

    timeout: 10000,

    headers: {
        "Content-Type": "application/json"
    }
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken()

        if(token && !isApiUrlWhiteListed(config.url)) {
            config.headers["Authorization"] = `Bearer ${token}`
        }

        return config
    },

    (error) => {
        return Promise.reject(error)
    }

)

axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },

    (error) => {
        if(!error.response) {
            return Promise.reject({
                status: 408,
                type: "NETWORK_ERROR",
                message: "Une erreur de reseau est survenue "
            })
        } else {
            if (error.respnse &&  error.response.status === 403) {
                removeToken()
                window.location.replace("auth/login")
            }
        }

        return Promise.reject(error)
    }
)


export default axiosInstance