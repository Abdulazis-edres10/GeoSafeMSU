import { createContext, useState, useEffect } from 'react'
import { USERS } from '../data/mockData'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('geosafe_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('geosafe_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password)
    if (!found) return { success: false, message: 'Invalid username or password.' }
    const safeUser = { userID: found.userID, name: found.name, username: found.username, role: found.role }
    setUser(safeUser)
    setIsAuthenticated(true)
    localStorage.setItem('geosafe_user', JSON.stringify(safeUser))
    return { success: true, role: found.role }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('geosafe_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
