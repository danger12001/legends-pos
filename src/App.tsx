import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminRoute } from './components/AdminRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './components/Login'
import { POS } from './pages/POS'
import { Products } from './pages/Products'
import { Shift } from './pages/Shift'
import { Staff } from './pages/Staff'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shift"
            element={
              <ProtectedRoute>
                <Shift />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <AdminRoute>
                <Staff />
              </AdminRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
