import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export function Login() {
  const { user, unauthorized, unauthorizedEmail, signInWithGoogle } = useAuth()

  if (user) return <Navigate to="/" replace />

  return (
    <div className="login">
      <h1>POS</h1>
      {unauthorized && (
        <p className="login-unauthorized">
          {unauthorizedEmail ?? 'This account'} isn't approved. Contact an admin.
        </p>
      )}
      <button type="button" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </button>
    </div>
  )
}
