import { useEffect, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import type { Shift, StockTakeLine } from '../types'

const shiftsCollection = collection(db, 'shifts')

export function useShift() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(shiftsCollection, where('status', '==', 'open'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const [first] = snapshot.docs
      setActiveShift(first ? ({ id: first.id, ...first.data() } as Shift) : null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const startShift = async (uid: string, name: string) => {
    await addDoc(shiftsCollection, {
      status: 'open',
      startedAt: Date.now(),
      startedByUid: uid,
      startedByName: name,
    })
  }

  const endShift = async (
    shift: Shift,
    uid: string,
    name: string,
    counts: { productId: string; name: string; expected: number; counted: number }[]
  ) => {
    const stockTake: StockTakeLine[] = counts.map((line) => ({
      ...line,
      variance: line.counted - line.expected,
    }))

    const batch = writeBatch(db)
    for (const line of stockTake) {
      batch.update(doc(db, 'products', line.productId), { stock: line.counted })
    }
    batch.update(doc(db, 'shifts', shift.id), {
      status: 'closed',
      endedAt: Date.now(),
      endedByUid: uid,
      endedByName: name,
      stockTake,
    })
    await batch.commit()
  }

  return { activeShift, loading, startShift, endShift }
}
