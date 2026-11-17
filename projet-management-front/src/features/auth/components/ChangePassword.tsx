import { useState } from "react"
// import { useNavigate } from "react-router-dom"
import type { changePasswordRequest } from "../interfaces/change-password-request"
// import type { changePasswordResponse } from "../interfaces/change-password-response"
import { changePassword } from "../services/authService"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import { getApiErrorMessage } from "../../../utils/tools"


function ChangePassword() {
    const [oldPassword, setOldPassword] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")
    const [error, setError] = useState<string | null | undefined>()
    const navigate:NavigateFunction = useNavigate()

    // const navigate = useNavigate()

    const handleChangePassword = async (event: React.ChangeEvent<HTMLFormElement>) => {
        setError(null)
        event.preventDefault()

        if(oldPassword==="" || password==="" || passwordConfirmation===""){
            alert("Veuillez remplir tous les champs")
            return
        }

        try {
            const changePasswordRequest: changePasswordRequest = {
                current_password: oldPassword,
                password,
                password_confirmation: passwordConfirmation
            }
    
    
            const response = await changePassword(changePasswordRequest)
    
            console.log(response.data)
            navigate("/home/dashboard")
        } catch (error:any) {
            setError(getApiErrorMessage(error))
            // setError(e?.response?.message?.)
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
                    <form onSubmit={handleChangePassword} className="flex flex-col mb-5">
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">Ancien mot de passe</label>
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
                                    placeholder="Saisir votre ancien mot de passe" 
                                    value={oldPassword} 
                                    onChange={(e)=>setOldPassword(e.target.value)}
                                    required
                                    className="w-full text-xs focus:outline-0 placeholder:text-gray placeholder:text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs  mb-1">Nouveau mot de Passe</label>
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
                                    placeholder="Votre nouveau mot de passe" 
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value) }
                                    required
                                    className="w-full text-xs focus:outline-0 placeholder:text-gray placeholder:text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-xs  mb-1">Confirmer votre nouveau mot de Passe</label>
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
                                    placeholder="Confirmer votre nouveau mot de passe" 
                                    value={passwordConfirmation}
                                    onChange={ (e)=>setPasswordConfirmation(e.target.value) }
                                    required
                                    className="w-full text-xs focus:outline-0 placeholder:text-gray placeholder:text-xs"
                                />
                            </div>
                        </div>
                        <button type="submit" className="flex hover:bg-blue-900 justify-center items-center gap-2 rounded-sm bg-blue-800 p-2 text-white text-sm">
                            Confirmer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword