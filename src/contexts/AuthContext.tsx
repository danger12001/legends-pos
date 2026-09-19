import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useStaffRole } from '../hooks/useStaffRole'
import type { StaffRole } from '../types'

interface AuthContextValue {
  user: User | null
  role: StaffRole | null
  loading: boolean
  unauthorized: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const { role, loading: roleLoading } = useStaffRole(user?.email ?? null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user && !roleLoading && role === null) {
      setUnauthorized(true)
      void firebaseSignOut(auth)
    }
  }, [user, role, roleLoading])

  const signInWithGoogle = async () => {
    setUnauthorized(false)
    await signInWithPopup(auth, googleProvider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const loading = authLoading || (!!user && roleLoading)

  return (
    <AuthContext.Provider value={{ user, role, loading, unauthorized, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
