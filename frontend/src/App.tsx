import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Applications = lazy(() => import('./pages/Applications'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Settings = lazy(() => import('./pages/Settings'))
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'))
const Cvs = lazy(() => import('./pages/Cvs'))

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<main className="detail-loading">Đang tải JobTrack...</main>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/applications/:id" element={<ApplicationDetail />} />
              <Route path="/cvs" element={<Cvs />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
