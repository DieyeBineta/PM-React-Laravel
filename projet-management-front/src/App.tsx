import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getToken } from './commons/services/tokenService'
import Login from './features/auth/components/Login'
// import Signup from './features/auth/components/Signup'
import Home from './features/home/Home'
import ChangePassword from './features/auth/components/ChangePassword'
import Dashboard from './features/home/components/Dashboard'
import Users from './features/users/components/Users'
import UserCreate from './features/users/components/UserCreate'

function ProtectedRoute({ children }: { children: ReactNode }) {
  return getToken() ? children : <Navigate to="/auth/login" replace />
}

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          {/* <Route path="/auth/signup" element={<Signup />} /> */}
          <Route path="/auth/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/home/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users/users/create" element={<ProtectedRoute><UserCreate /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App