const TOKEN_KEY: string = "token"
const getToken = (): any => localStorage.getItem(TOKEN_KEY)
const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
const removeToken= (): void => localStorage.removeItem(TOKEN_KEY)

export { getToken, setToken, removeToken }