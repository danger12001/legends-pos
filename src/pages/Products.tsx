import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavBar } from '../components/NavBar'
import { useProducts } from '../hooks/useProducts'
import { formatPrice } from '../utils/currency'
import './Products.css'

export function Products() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !price) return
    await addProduct({
      name,
      price: Number(price),
      sku,
      stock: Number(stock) || 0,
    })
    setName('')
    setPrice('')
    setSku('')
    setStock('')
  }

  return (
    <div className="products-page">
      <NavBar />
      <div className="products-content">
        <h1>Products</h1>

        <form className="product-form" onSubmit={(e) => void handleSubmit(e)}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
          <input
            placeholder="Stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <button type="submit">Add product</button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => void updateProduct(product.id, { stock: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => void deleteProduct(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
