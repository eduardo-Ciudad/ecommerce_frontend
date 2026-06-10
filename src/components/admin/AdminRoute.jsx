import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
