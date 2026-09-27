import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoaderCircle } from 'lucide-react'

type ProtectedRouteProps = {
  children?: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="detail-loading">
        <LoaderCircle className="spin" size={26} />
        <span>Đang kiểm tra đăng nhập...</span>
      </main>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
