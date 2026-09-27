import { Bell, Search, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFollowUps } from '../services/applicationService'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('search') ?? '')
  const [reminderCount, setReminderCount] = useState(0)

  useEffect(() => { getFollowUps(7).then((items) => setReminderCount(items.length)).catch(() => setReminderCount(0)) }, [location.pathname])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentSearch = new URLSearchParams(location.search).get('search') ?? ''
      if (query.trim() && query.trim() !== currentSearch.trim()) {
        navigate(`/applications?search=${encodeURIComponent(query.trim())}`, { replace: true })
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query, location.pathname, location.search, navigate])

  return <header className="app-navbar"><div className="global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm công ty, vị trí..." aria-label="Tìm kiếm toàn cục" /><kbd>⌘ K</kbd></div><div className="navbar-actions"><button className="navbar-icon-button" type="button" onClick={() => navigate('/?reminders=1')} aria-label={`${reminderCount} thông báo follow-up`}><Bell size={18} />{reminderCount > 0 && <i>{Math.min(reminderCount, 9)}</i>}</button><button className="navbar-profile" type="button" onClick={() => navigate('/settings')}><span className="avatar">{(user?.fullName || user?.email || 'U')[0].toUpperCase()}</span><span><b>{user?.fullName || 'Người dùng'}</b><small>{user?.email}</small></span><Settings size={16} /></button></div></header>
}
