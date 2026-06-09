import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

function getUserFromToken(token) {
  if (!token) return null
  const decoded = decodeJWT(token)
  if (!decoded) return null
  return {
    id: decoded.sub || decoded.id,
    name: decoded.name || decoded.username,
    email: decoded.email,
    role: decoded.role || decoded.roles?.[0],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const userData = getUserFromToken(token)
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const userData = getUserFromToken(data.accessToken)
    setUser(userData)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const userData = getUserFromToken(data.accessToken)
    setUser(userData)
    return data
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
