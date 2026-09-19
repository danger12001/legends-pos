import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './NavBar.css'

export function NavBar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/" end>
          POS
        </NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/shift">Shift</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.displayName}</span>
        <button type="button" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
