import { Bell, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFollowUps } from '../services/applicationService'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [reminderCount, setReminderCount] = useState(0)

  useEffect(() => {
    getFollowUps(7).then((items) => setReminderCount(items.length)).catch(() => setReminderCount(0))
  }, [location.pathname])

  return (
    <header className="app-navbar" style={{ justifyContent: 'flex-end' }}>
      <div className="navbar-actions">
        <button
          className="navbar-icon-button"
          type="button"
          onClick={() => navigate('/?reminders=1')}
          aria-label={`${reminderCount} thông báo follow-up`}
        >
          <Bell size={18} />
          {reminderCount > 0 && <i>{Math.min(reminderCount, 9)}</i>}
        </button>
        <button className="navbar-profile" type="button" onClick={() => navigate('/settings')}>
          <span className="avatar">{(user?.fullName || user?.email || 'U')[0].toUpperCase()}</span>
          <span>
            <b>{user?.fullName || 'Người dùng'}</b>
            <small>{user?.email}</small>
          </span>
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
