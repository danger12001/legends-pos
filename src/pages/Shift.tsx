import { useState } from 'react'
import { NavBar } from '../components/NavBar'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useShift } from '../hooks/useShift'
import type { Shift as ShiftType, StockTakeLine } from '../types'
import './Shift.css'

export function Shift() {
  const { user } = useAuth()
  const { products } = useProducts()
  const { activeShift, startShift, endShift } = useShift()
  const [counts, setCounts] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [closedSummary, setClosedSummary] = useState<StockTakeLine[] | null>(null)

  const handleStart = async () => {
    if (!user) return
    setBusy(true)
    try {
      await startShift(user.uid, user.displayName ?? 'Unknown')
    } finally {
      setBusy(false)
    }
  }

  const handleEnd = async (shift: ShiftType) => {
    if (!user) return
    setBusy(true)
    try {
      const lines = products.map((product) => ({
        productId: product.id,
        name: product.name,
        expected: product.stock,
        counted: Number(counts[product.id]),
      }))
      await endShift(shift, user.uid, user.displayName ?? 'Unknown', lines)
      setClosedSummary(lines.map((line) => ({ ...line, variance: line.counted - line.expected })))
      setCounts({})
    } finally {
      setBusy(false)
    }
  }

  const allCounted = products.length > 0 && products.every((product) => counts[product.id]?.trim())

  return (
    <div className="shift-page">
      <NavBar />
      <div className="shift-content">
        {!activeShift ? (
          <>
            <h1>No active shift</h1>
            <button type="button" disabled={busy} onClick={() => void handleStart()}>
              Start shift
            </button>

            {closedSummary && (
              <div className="stock-take-summary">
                <h2>Last shift's stock take</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Expected</th>
                      <th>Counted</th>
                      <th>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedSummary.map((line) => (
                      <tr key={line.productId} className={line.variance !== 0 ? 'variance' : ''}>
                        <td>{line.name}</td>
                        <td>{line.expected}</td>
                        <td>{line.counted}</td>
                        <td>{line.variance > 0 ? `+${line.variance}` : line.variance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h1>Shift in progress</h1>
            <p>
              Started by {activeShift.startedByName} at{' '}
              {new Date(activeShift.startedAt).toLocaleString()}
            </p>

            <h2>Stock take</h2>
            <table className="stock-take-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Expected</th>
                  <th>Counted</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const counted = counts[product.id]
                  const variance = counted?.trim() ? Number(counted) - product.stock : null
                  return (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={counted ?? ''}
                          onChange={(e) => setCounts((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        />
                      </td>
                      <td>{variance === null ? '' : variance > 0 ? `+${variance}` : variance}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <button type="button" disabled={!allCounted || busy} onClick={() => void handleEnd(activeShift)}>
              {busy ? 'Processing...' : 'End shift'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
