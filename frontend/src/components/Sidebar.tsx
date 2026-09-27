import { useEffect, useState } from 'react'
import { BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, FileText, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Ứng tuyển', icon: BriefcaseBusiness, end: false },
  { to: '/analytics', label: 'Thống kê', icon: BarChart3, end: false },
  { to: '/cvs', label: 'Kho CV', icon: FileText, end: false },
  { to: '/settings', label: 'Cài đặt', icon: Settings, end: false },
]

interface SidebarProps {
  isOpenMobile?: boolean
  onCloseMobile?: () => void
}

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('jobtrack_sidebar_collapsed') === 'true')
  useEffect(() => { document.documentElement.dataset.theme = 'light'; localStorage.setItem('jobtrack_theme', 'light') }, [])
  useEffect(() => { document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'expanded'; localStorage.setItem('jobtrack_sidebar_collapsed', String(collapsed)) }, [collapsed])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpenMobile && onCloseMobile) {
        onCloseMobile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpenMobile, onCloseMobile])

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpenMobile ? 'is-visible' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''} ${isOpenMobile ? 'is-mobile-open' : ''}`}>
        <div
          className="sidebar-brand"
          onClick={() => { handleLinkClick(); navigate('/') }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleLinkClick(); navigate('/') } }}
          aria-label="JobTrack Trang chủ"
        >
          <span className="brand-mark"><BriefcaseBusiness size={18} /></span>
          <span className="sidebar-brand-name">JobTrack</span>
        </div>
        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
              title={collapsed ? label : undefined}
              aria-label={label}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">

          <button
            className="sidebar-profile"
            type="button"
            onClick={() => { handleLinkClick(); navigate('/settings') }}
            title={collapsed ? user?.email : undefined}
            aria-label="Cài đặt tài khoản"
          >
            <span className="avatar">{(user?.fullName || user?.email || 'U')[0].toUpperCase()}</span>
            <span>
              <b>{user?.fullName || 'Người dùng'}</b>
              <small>{user?.email}</small>
            </span>
          </button>
          <button
            className="sidebar-link sidebar-action"
            type="button"
            onClick={() => { handleLinkClick(); logout(); navigate('/login', { replace: true }) }}
            title={collapsed ? 'Đăng xuất' : undefined}
            aria-label="Đăng xuất"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
        <button
          className="sidebar-collapse"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>
    </>
  )
}

