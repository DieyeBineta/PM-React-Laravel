import { useState } from "react"
import type { loginRequest } from "../interfaces/login-request"
import { login } from "../services/authService"
// import type { LoginResponse } from "../interfaces/login-response"
import { useNavigate } from "react-router-dom"
import { setToken } from "../../../commons/services/tokenService"
import { getApiErrorMessage } from "../../../utils/tools"

function Login() {
    const [email, setEmail] = useState<string>("")  
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string | null | undefined>("")
    const navigate = useNavigate()

    const handleLogin = async (event: React.ChangeEvent<HTMLFormElement>) => {
        setError(null)
        event.preventDefault()

        if(email=="" && password==""){
            alert("Veuillez remplir tous les champs")
            return
        }

        const loginRequest: loginRequest = {
            email,
            password
        }

        try {
            const response = await login(loginRequest)
            setToken(response.access_token)
            console.log(response)
    
            if(response.must_change_password) { 
                navigate("/auth/change-password") 
            } else {
                navigate("/home/dashboard")
            }

            // if(response) navigate("/home")
        } catch (error: any) {
            setError(getApiErrorMessage(error))
        }
    }

    return (
        <div className="m-auto my-3 h-full flex flex-col justify-center items-center mt-20">
            <div >
                <div className="text-center">
                    <h1 className="font-bold text-3xl mb-3 text-blue-800">HealDocs</h1>
                    <p className="text-xs w-100">Secure productivity and clinical document management for modern healthcare teams</p>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl my-5 max-w-100">
                    {error && <p className="text-xs text-center text-red-500 mb-1">*{error}*</p>}
                    <form onSubmit={handleLogin} className="flex flex-col mb-5">
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">Adresse Email</label>
                            <div className="border p-2 rounded-sm flex items-center mb-5 gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                                    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linejoin="round"/>
                                    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linejoin="round"/>
                                    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                                    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linejoin="round"/>
                                    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                                <input
                                    type="email" 
                                    placeholder="adresseemail@example.com" 
                                    value={email}
                                    onChange={(e)=>setEmail(e.target.value) }
                                    required
                                    className="w-full text-xs focus:outline-0 placeholder:text-gray placeholder:text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex justify-between mb-1">
                                <label className="text-xs">Mot de Passe</label>
                                <a className="text-xs text-blue-600">Mot de passe oublié ?</a>
                            </div>
                            <div className="border p-2 rounded-sm flex items-center mb-5 gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16.5V14.5" stroke="#141B34" stroke-width="1.5" stroke-linecap="round"/>
                                    <path d="M12 16.5V14.5" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round"/>
                                    <path d="M12 16.5V14.5" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round"/>
                                    <path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z" stroke="#141B34" stroke-width="1.5"/>
                                    <path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5"/>
                                    <path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5"/>
                                    <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <input
                                    type="password" 
                                    placeholder="x x x x x x " 
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value) }
                                    required
                                    className="w-full text-xs focus:outline-0 placeholder:text-gray placeholder:text-xs"
                                />
                            </div>
                        </div>
                        <button type="submit" className="flex hover:bg-blue-900 justify-center items-center gap-2 rounded-sm bg-blue-800 p-2 text-white text-sm">
                            LoginIn to HealDocs
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 11.9998L4 11.9998" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20 11.9998L4 11.9998" stroke="white" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M20 11.9998L4 11.9998" stroke="white" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 17C15 17 20 13.3176 20 12C20 10.6824 15 7 15 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 17C15 17 20 13.3176 20 12C20 10.6824 15 7 15 7" stroke="white" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 17C15 17 20 13.3176 20 12C20 10.6824 15 7 15 7" stroke="white" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </form>

                    <div className="flex items-center justify-between mb-5 gap-px">
                        <div className="h-px w-30 bg-gray-200 box-border"></div>
                        <p className="text-xs box-border">Ou contiuer avec</p>
                        <div className="h-px w-30 bg-gray-200 box-border"></div>
                    </div>

                    <div className="flex justify-between gap-2 box-content">
                        <button className="flex items-center gap-2 justify-center w-45 py-1.5 border text-xs font-bold box-border rounded-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#141B34" stroke-width="1.5"/>
                                <circle cx="12" cy="12" r="10" stroke="black" stroke-opacity="0.2" stroke-width="1.5"/>
                                <circle cx="12" cy="12" r="10" stroke="black" stroke-opacity="0.2" stroke-width="1.5"/>
                                <path d="M12 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C13.3807 7 14.6307 7.55964 15.5355 8.46447" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C13.3807 7 14.6307 7.55964 15.5355 8.46447" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C13.3807 7 14.6307 7.55964 15.5355 8.46447" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center gap-2 justify-center w-45 py-1.5 border text-xs font-bold box-border rounded-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.5 15.5C13.5 14.5572 13.5 14.0858 13.7929 13.7929C14.0858 13.5 14.5572 13.5 15.5 13.5H20C20.9428 13.5 21.4142 13.5 21.7071 13.7929C22 14.0858 22 14.5572 22 15.5V20C22 20.9428 22 21.4142 21.7071 21.7071C21.4142 22 20.9428 22 20 22H15.5C14.5572 22 14.0858 22 13.7929 21.7071C13.5 21.4142 13.5 20.9428 13.5 20V15.5Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 15.5C13.5 14.5572 13.5 14.0858 13.7929 13.7929C14.0858 13.5 14.5572 13.5 15.5 13.5H20C20.9428 13.5 21.4142 13.5 21.7071 13.7929C22 14.0858 22 14.5572 22 15.5V20C22 20.9428 22 21.4142 21.7071 21.7071C21.4142 22 20.9428 22 20 22H15.5C14.5572 22 14.0858 22 13.7929 21.7071C13.5 21.4142 13.5 20.9428 13.5 20V15.5Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 15.5C13.5 14.5572 13.5 14.0858 13.7929 13.7929C14.0858 13.5 14.5572 13.5 15.5 13.5H20C20.9428 13.5 21.4142 13.5 21.7071 13.7929C22 14.0858 22 14.5572 22 15.5V20C22 20.9428 22 21.4142 21.7071 21.7071C21.4142 22 20.9428 22 20 22H15.5C14.5572 22 14.0858 22 13.7929 21.7071C13.5 21.4142 13.5 20.9428 13.5 20V15.5Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 4C2 3.05719 2 2.58579 2.29289 2.29289C2.58579 2 3.05719 2 4 2H8.5C9.44281 2 9.91421 2 10.2071 2.29289C10.5 2.58579 10.5 3.05719 10.5 4V8.5C10.5 9.44281 10.5 9.91421 10.2071 10.2071C9.91421 10.5 9.44281 10.5 8.5 10.5H4C3.05719 10.5 2.58579 10.5 2.29289 10.2071C2 9.91421 2 9.44281 2 8.5V4Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 4C2 3.05719 2 2.58579 2.29289 2.29289C2.58579 2 3.05719 2 4 2H8.5C9.44281 2 9.91421 2 10.2071 2.29289C10.5 2.58579 10.5 3.05719 10.5 4V8.5C10.5 9.44281 10.5 9.91421 10.2071 10.2071C9.91421 10.5 9.44281 10.5 8.5 10.5H4C3.05719 10.5 2.58579 10.5 2.29289 10.2071C2 9.91421 2 9.44281 2 8.5V4Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 4C2 3.05719 2 2.58579 2.29289 2.29289C2.58579 2 3.05719 2 4 2H8.5C9.44281 2 9.91421 2 10.2071 2.29289C10.5 2.58579 10.5 3.05719 10.5 4V8.5C10.5 9.44281 10.5 9.91421 10.2071 10.2071C9.91421 10.5 9.44281 10.5 8.5 10.5H4C3.05719 10.5 2.58579 10.5 2.29289 10.2071C2 9.91421 2 9.44281 2 8.5V4Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 15.5C2 14.5572 2 14.0858 2.29289 13.7929C2.58579 13.5 3.05719 13.5 4 13.5H8.5C9.44281 13.5 9.91421 13.5 10.2071 13.7929C10.5 14.0858 10.5 14.5572 10.5 15.5V20C10.5 20.9428 10.5 21.4142 10.2071 21.7071C9.91421 22 9.44281 22 8.5 22H4C3.05719 22 2.58579 22 2.29289 21.7071C2 21.4142 2 20.9428 2 20V15.5Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 15.5C2 14.5572 2 14.0858 2.29289 13.7929C2.58579 13.5 3.05719 13.5 4 13.5H8.5C9.44281 13.5 9.91421 13.5 10.2071 13.7929C10.5 14.0858 10.5 14.5572 10.5 15.5V20C10.5 20.9428 10.5 21.4142 10.2071 21.7071C9.91421 22 9.44281 22 8.5 22H4C3.05719 22 2.58579 22 2.29289 21.7071C2 21.4142 2 20.9428 2 20V15.5Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 15.5C2 14.5572 2 14.0858 2.29289 13.7929C2.58579 13.5 3.05719 13.5 4 13.5H8.5C9.44281 13.5 9.91421 13.5 10.2071 13.7929C10.5 14.0858 10.5 14.5572 10.5 15.5V20C10.5 20.9428 10.5 21.4142 10.2071 21.7071C9.91421 22 9.44281 22 8.5 22H4C3.05719 22 2.58579 22 2.29289 21.7071C2 21.4142 2 20.9428 2 20V15.5Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 4C13.5 3.05719 13.5 2.58579 13.7929 2.29289C14.0858 2 14.5572 2 15.5 2H20C20.9428 2 21.4142 2 21.7071 2.29289C22 2.58579 22 3.05719 22 4V8.5C22 9.44281 22 9.91421 21.7071 10.2071C21.4142 10.5 20.9428 10.5 20 10.5H15.5C14.5572 10.5 14.0858 10.5 13.7929 10.2071C13.5 9.91421 13.5 9.44281 13.5 8.5V4Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 4C13.5 3.05719 13.5 2.58579 13.7929 2.29289C14.0858 2 14.5572 2 15.5 2H20C20.9428 2 21.4142 2 21.7071 2.29289C22 2.58579 22 3.05719 22 4V8.5C22 9.44281 22 9.91421 21.7071 10.2071C21.4142 10.5 20.9428 10.5 20 10.5H15.5C14.5572 10.5 14.0858 10.5 13.7929 10.2071C13.5 9.91421 13.5 9.44281 13.5 8.5V4Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 4C13.5 3.05719 13.5 2.58579 13.7929 2.29289C14.0858 2 14.5572 2 15.5 2H20C20.9428 2 21.4142 2 21.7071 2.29289C22 2.58579 22 3.05719 22 4V8.5C22 9.44281 22 9.91421 21.7071 10.2071C21.4142 10.5 20.9428 10.5 20 10.5H15.5C14.5572 10.5 14.0858 10.5 13.7929 10.2071C13.5 9.91421 13.5 9.44281 13.5 8.5V4Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Microsoft
                        </button>
                    </div>
                </div>

                <div className="text-xs text-center">
                    <span>Don't have a HIPAA-complaint account?</span>
                    <a className="text-blue-700">Get started</a>
                </div>
            </div>
            
        </div>
    )
}

export default Login