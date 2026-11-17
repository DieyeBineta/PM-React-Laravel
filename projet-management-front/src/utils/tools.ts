import { AxiosError } from "axios"
// import { apiBaseUrl } from "../config/api"

const isApiUrlWhiteListed = (url: any): boolean => {
    const WHITELISTED_URL = ['/login']
    return WHITELISTED_URL.includes(url)
}

const getApiErrorMessage = (error: any): string => {

    if (error instanceof AxiosError) {
        return error?.response?.data?.message || "Une erreur HTTP est survenue"
    }

    return "Une erreur est survenue"
}

export { isApiUrlWhiteListed, getApiErrorMessage }