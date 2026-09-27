import { useEffect, useState } from 'react'
import { BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, FileText, LayoutDashboard, LogOut, Moon, Settings, Sun } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Ứng tuyển', icon: BriefcaseBusiness, end: false },
  { to: '/analytics', label: 'Thống kê', icon: BarChart3, end: false },
  { to: '/cvs', label: 'Kho CV', icon: FileText, end: false },
  { to: '/settings', label: 'Cài đặt', icon: Settings, end: false },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('jobtrack_sidebar_collapsed') === 'true')
  const [dark, setDark] = useState(() => localStorage.getItem('jobtrack_theme') === 'dark')

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('jobtrack_theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'expanded'; localStorage.setItem('jobtrack_sidebar_collapsed', String(collapsed)) }, [collapsed])

  return <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="sidebar-brand"><span className="brand-mark"><BriefcaseBusiness size={18} /></span><span className="sidebar-brand-name">JobTrack</span></div>
    <nav className="sidebar-nav" aria-label="Điều hướng chính">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`} title={collapsed ? label : undefined}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-footer"><button className="sidebar-link sidebar-action" type="button" onClick={() => setDark((value) => !value)} title={collapsed ? 'Đổi theme' : undefined}>{dark ? <Sun size={18} /> : <Moon size={18} />}<span>{dark ? 'Light mode' : 'Dark mode'}</span></button><button className="sidebar-profile" type="button" onClick={() => navigate('/settings')} title={collapsed ? user?.email : undefined}><span className="avatar">{(user?.fullName || user?.email || 'U')[0].toUpperCase()}</span><span><b>{user?.fullName || 'Người dùng'}</b><small>{user?.email}</small></span></button><button className="sidebar-link sidebar-action" type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }} title={collapsed ? 'Đăng xuất' : undefined}><LogOut size={18} /><span>Đăng xuất</span></button></div>
    <button className="sidebar-collapse" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
  </aside>
}
