import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { recordSale } from '../services/sales'
import type { CartItem, Product, Tab } from '../types'

const tabsCollection = collection(db, 'tabs')

function withItem(items: CartItem[], product: Product): CartItem[] {
  const existing = items.find((item) => item.productId === product.id)
  if (existing) {
    return items.map((item) =>
      item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
    )
  }
  return [...items, { productId: product.id, name: product.name, price: product.price, qty: 1 }]
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(tabsCollection, orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTabs(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Tab))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const openTab = async (customerName: string, openedByUid: string, openedByName: string) => {
    await addDoc(tabsCollection, {
      customerName,
      items: [],
      createdAt: Date.now(),
      openedByUid,
      openedByName,
    })
  }

  const addItem = async (tab: Tab, product: Product) => {
    await updateDoc(doc(db, 'tabs', tab.id), { items: withItem(tab.items, product) })
  }

  const setQty = async (tab: Tab, productId: string, qty: number) => {
    const items =
      qty <= 0
        ? tab.items.filter((item) => item.productId !== productId)
        : tab.items.map((item) => (item.productId === productId ? { ...item, qty } : item))
    await updateDoc(doc(db, 'tabs', tab.id), { items })
  }

  const removeItem = async (tab: Tab, productId: string) => {
    await updateDoc(doc(db, 'tabs', tab.id), {
      items: tab.items.filter((item) => item.productId !== productId),
    })
  }

  const closeTab = async (tab: Tab, cashierUid: string) => {
    await recordSale(tab.items, cashierUid)
    await deleteDoc(doc(db, 'tabs', tab.id))
  }

  const cancelTab = async (tab: Tab) => {
    await deleteDoc(doc(db, 'tabs', tab.id))
  }

  return { tabs, loading, openTab, addItem, setQty, removeItem, closeTab, cancelTab }
}
