import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavBar } from '../components/NavBar'
import { useAuth } from '../contexts/AuthContext'
import { useStaff } from '../hooks/useStaff'
import type { StaffRole } from '../types'
import './Staff.css'

export function Staff() {
  const { user } = useAuth()
  const { staff, loading, addStaff, updateRole, removeStaff } = useStaff()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('staff')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !user) return
    await addStaff(email, role, user.displayName ?? 'Unknown')
    setEmail('')
    setRole('staff')
  }

  const handleRemove = async (targetEmail: string) => {
    if (targetEmail === user?.email) {
      if (!window.confirm('This removes your own admin access. Continue?')) return
    }
    await removeStaff(targetEmail)
  }

  return (
    <div className="staff-page">
      <NavBar />
      <div className="staff-content">
        <h1>Staff</h1>

        <form className="staff-form" onSubmit={(e) => void handleSubmit(e)}>
          <input
            placeholder="Gmail address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-scroll">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.email}>
                    <td>{member.email}</td>
                    <td>
                      <select
                        value={member.role}
                        onChange={(e) => void updateRole(member.email, e.target.value as StaffRole)}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{member.addedByName}</td>
                    <td>
                      <button type="button" onClick={() => void handleRemove(member.email)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
