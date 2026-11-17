import { useEffect, useState } from 'react'
import type { User } from '../../auth/interfaces/user'
// import type { GetUserResponse } from '../interfaces/GetUserResponse'
import { getUsers } from '../services/userService'
import { getApiErrorMessage } from '../../../utils/tools'

function Users() {
    const [error, setError] = useState<string | null | undefined>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [users, setUsers] = useState<User[]>([])
    useEffect(()=>{
        const fetchUsers = async () => {
            setError(null)
            setLoading(true)
            try {
                const users = await getUsers();
                // console.log(users.data)
                setUsers(users.data)
            } catch(e) {
                setError(getApiErrorMessage(e))
            } finally{
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])
    return (
        <div>
            {error && <p>{error}</p>}

            { loading ? 
                (
                    <p>Chargement...</p>
                )
                :
                (
                    <ul>
                        {users.map((user)=>(
                            <li key={user.id}>{user.name}</li>
                        ))}
                    </ul>
                )
            }
        </div>
    )
}

export default Users