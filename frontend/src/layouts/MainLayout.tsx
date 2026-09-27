import { useState } from 'react'
import { BriefcaseBusiness, Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu điều hướng"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <span className="brand-mark"><BriefcaseBusiness size={18} /></span>
          <span className="brand-name">JobTrack</span>
        </div>
      </header>
      <Sidebar isOpenMobile={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-main">
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

