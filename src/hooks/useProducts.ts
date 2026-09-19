import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Product } from '../types'

const productsCollection = collection(db, 'products')

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(productsCollection, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(
        snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product)
      )
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const addProduct = async (input: Omit<Product, 'id' | 'createdAt'>) => {
    await addDoc(productsCollection, { ...input, createdAt: Date.now() })
  }

  const updateProduct = async (id: string, input: Partial<Omit<Product, 'id'>>) => {
    await updateDoc(doc(db, 'products', id), input)
  }

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id))
  }

  return { products, loading, addProduct, updateProduct, deleteProduct }
}
