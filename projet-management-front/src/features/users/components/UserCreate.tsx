import React, { useState } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import type { CreateUserRequest } from '../interfaces/CreateUserRequest'
import { createUser } from '../services/userService'
import { getApiErrorMessage } from '../../../utils/tools'

function UserCreate() {
    const [name, setName] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [roleId, setRoleId] = useState<number>(0)
    const [error, setError] = useState<string | null | undefined>()
    const navigate:NavigateFunction = useNavigate()

    // const navigate = useNavigate()
    const resetField = () => {
        setName(""),
        setPassword(""),
        setEmail(""),
        setRoleId(0)
    }

    const handleUserCreate = async (event: React.ChangeEvent<HTMLFormElement>) => {
        setError(null)
        event.preventDefault()

        if(name==="" || password==="" || email==="" ){
            alert("Veuillez remplir tous les champs")
            return
        }

        try {
            const createUserRequest: CreateUserRequest = {
                name,
                password,
                email,
                role_id: roleId,
                password_confirmation: passwordConfirmation
            }
    
    
            const response = await createUser(createUserRequest)
    
            console.log(response.data)
            navigate("/home/dashboard")
        } catch (error:any) {
            setError(getApiErrorMessage(error))
            // setError(e?.response?.message?.)
        } finally {
            resetField()
        }
    }

    return (
        <div>
            {error && <p>{error}</p>}
                <form onSubmit={handleUserCreate}>
                    <input 
                        type="text" 
                        placeholder="Saisir votre nom" 
                        value={name} 
                        onChange={(e)=>setName(e.target.value)}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Saisir votre email" 
                        value={email}
                        onChange={(e)=>setEmail(e.target.value) }
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        value={password}
                        onChange={ (e)=>setPassword(e.target.value) }
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirmer le mot de passe" 
                        value={passwordConfirmation}
                        onChange={ (e)=>setPasswordConfirmation(e.target.value) }
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Entrez le role" 
                        value={roleId}
                        onChange={ (e)=>setRoleId(Number(e.target.value)) }
                        required
                    />
                    <button type="submit">Confirmer</button>
                </form>
        </div>
    )
}

export default UserCreate