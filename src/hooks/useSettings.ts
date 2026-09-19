import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useSettings() {
  const [managerCode, setManagerCode] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'app'), (snapshot) => {
      setManagerCode(snapshot.data()?.managerCode)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { managerCode, loading }
}
