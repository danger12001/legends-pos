export interface Product {
  id: string
  name: string
  price: number
  sku: string
  stock: number
  createdAt: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

export interface Tab {
  id: string
  customerName: string
  items: CartItem[]
  createdAt: number
  openedByUid: string
  openedByName: string
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  createdAt: number
  cashierUid: string
}

export interface StockTakeLine {
  productId: string
  name: string
  expected: number
  counted: number
  variance: number
}

export interface Shift {
  id: string
  status: 'open' | 'closed'
  startedAt: number
  startedByUid: string
  startedByName: string
  endedAt?: number
  endedByUid?: string
  endedByName?: string
  stockTake?: StockTakeLine[]
}

export type StaffRole = 'staff' | 'admin'

export interface StaffMember {
  email: string
  role: StaffRole
  addedAt: number
  addedByName: string
}
