import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { StaffRole } from '../types'

export function useStaffRole(email: string | null) {
  const [role, setRole] = useState<StaffRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) {
      setRole(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'staff', email),
      (snapshot) => {
        const data = snapshot.data()
        setRole(data ? (data.role as StaffRole) : null)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to look up staff role:', error)
        setRole(null)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [email])

  return { role, loading }
}
