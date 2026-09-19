import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useSettings } from '../hooks/useSettings'
import { useShift } from '../hooks/useShift'
import { useTabs } from '../hooks/useTabs'
import { formatPrice } from '../utils/currency'
import { confirmManagerCode } from '../utils/managerAuth'
import './POS.css'

export function POS() {
  const { user } = useAuth()
  const { products, loading } = useProducts()
  const { managerCode } = useSettings()
  const { activeShift, loading: shiftLoading } = useShift()
  const { tabs, openTab, addItem, setQty, removeItem, closeTab, cancelTab } = useTabs()
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [newTabName, setNewTabName] = useState('')
  const [busy, setBusy] = useState(false)

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null
  const total = activeTab ? activeTab.items.reduce((sum, item) => sum + item.price * item.qty, 0) : 0

  const handleOpenTab = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTabName.trim() || !user) return
    const name = newTabName.trim()
    setNewTabName('')
    await openTab(name, user.uid, user.displayName ?? 'Unknown')
  }

  const handleClose = async () => {
    if (!activeTab || !user) return
    setBusy(true)
    try {
      await closeTab(activeTab, user.uid)
      setActiveTabId(null)
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async () => {
    if (!activeTab) return
    if (!confirmManagerCode(managerCode)) return
    setBusy(true)
    try {
      await cancelTab(activeTab)
      setActiveTabId(null)
    } finally {
      setBusy(false)
    }
  }

  if (!shiftLoading && !activeShift) {
    return (
      <div className="pos-page">
        <NavBar />
        <div className="no-shift">
          <p>No active shift</p>
          <p>
            <Link to="/shift">Start a shift</Link> to begin selling.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pos-page">
      <NavBar />
      <div className="tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button${tab.id === activeTabId ? ' active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span>{tab.customerName}</span>
            <span className="tab-opener">{tab.openedByName}</span>
          </button>
        ))}
        <form className="new-tab-form" onSubmit={(e) => void handleOpenTab(e)}>
          <input
            placeholder="New tab name"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
          />
          <button type="submit">+ New tab</button>
        </form>
      </div>

      <div className="pos-content">
        {!activeTab ? (
          <div className="no-tab-selected">
            <p>No tab selected</p>
            <p>Select an open tab above, or start a new one, to add items.</p>
          </div>
        ) : (
          <div className="product-grid">
            {loading ? (
              <p>Loading...</p>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  className="product-card"
                  disabled={product.stock <= 0}
                  onClick={() => void addItem(activeTab, product)}
                >
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">{formatPrice(product.price)}</span>
                  <span className="product-stock">{product.stock <= 0 ? 'Out of stock' : `${product.stock} in stock`}</span>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab && (
          <div className="cart">
            <h2>{activeTab.customerName}</h2>
            <p className="cart-opener">Opened by {activeTab.openedByName}</p>
            <ul className="cart-items">
              {activeTab.items.map((item) => (
                <li key={item.productId}>
                  <span>{item.name}</span>
                  <input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(e) => void setQty(activeTab, item.productId, Number(e.target.value))}
                  />
                  <span>{formatPrice(item.price * item.qty)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmManagerCode(managerCode)) void removeItem(activeTab, item.productId)
                    }}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-total">Total: {formatPrice(total)}</div>
            <button
              type="button"
              className="checkout-button"
              disabled={activeTab.items.length === 0 || busy}
              onClick={() => void handleClose()}
            >
              {busy ? 'Processing...' : 'Close tab'}
            </button>
            <button type="button" className="cancel-button" disabled={busy} onClick={() => void handleCancel()}>
              Cancel tab
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
