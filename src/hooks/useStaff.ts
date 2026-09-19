import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { StaffMember, StaffRole } from '../types'

const staffCollection = collection(db, 'staff')

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(staffCollection, orderBy('addedAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map((docSnap) => docSnap.data() as StaffMember))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const addStaff = async (email: string, role: StaffRole, addedByName: string) => {
    const normalized = email.trim().toLowerCase()
    await setDoc(doc(db, 'staff', normalized), {
      email: normalized,
      role,
      addedAt: Date.now(),
      addedByName,
    })
  }

  const updateRole = async (email: string, role: StaffRole) => {
    await updateDoc(doc(db, 'staff', email), { role })
  }

  const removeStaff = async (email: string) => {
    await deleteDoc(doc(db, 'staff', email))
  }

  return { staff, loading, addStaff, updateRole, removeStaff }
}
