import { collection, doc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import type { CartItem } from '../types'

const salesCollection = collection(db, 'sales')

export async function recordSale(items: CartItem[], cashierUid: string) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const batch = writeBatch(db)
  const saleRef = doc(salesCollection)
  batch.set(saleRef, { items, total, createdAt: Date.now(), cashierUid })

  for (const item of items) {
    batch.update(doc(db, 'products', item.productId), { stock: increment(-item.qty) })
  }

  await batch.commit()
}
