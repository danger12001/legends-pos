import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export function Login() {
  const { user, signInWithGoogle } = useAuth()

  if (user) return <Navigate to="/" replace />

  return (
    <div className="login">
      <h1>POS</h1>
      <button type="button" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </button>
    </div>
  )
}
