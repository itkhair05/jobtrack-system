import type { ReactNode } from 'react'
import { ArrowRight, BellRing, CalendarClock, CircleAlert } from 'lucide-react'
import type { Application } from '../services/applicationService'

export default function ReminderCenter({ applications, onOpen }: { applications: Application[]; onOpen: (application: Application) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const overdue = applications.filter((application) => application.followUpDate && new Date(`${application.followUpDate}T00:00:00`) < today)
  const upcoming = applications.filter((application) => application.followUpDate && new Date(`${application.followUpDate}T00:00:00`) >= today)
  if (!applications.length) return null

  return <section className="reminder-panel"><header className="reminder-header"><div className="reminder-title"><span className="reminder-icon"><BellRing size={17} /></span><div><h2>Follow-up cần xử lý</h2><p>Đừng để cơ hội tốt bị bỏ quên.</p></div></div><span className="reminder-count">{applications.length} việc</span></header><div className="reminder-groups">{overdue.length > 0 && <ReminderGroup title="Quá hạn" icon={<CircleAlert size={15} />} items={overdue} tone="overdue" onOpen={onOpen} />}{upcoming.length > 0 && <ReminderGroup title="Trong 7 ngày tới" icon={<CalendarClock size={15} />} items={upcoming} tone="upcoming" onOpen={onOpen} />}</div></section>
}

function ReminderGroup({ title, icon, items, tone, onOpen }: { title: string; icon: ReactNode; items: Application[]; tone: 'overdue' | 'upcoming'; onOpen: (application: Application) => void }) {
  return <div className={`reminder-group ${tone}`}><div className="reminder-group-title">{icon}{title}<b>{items.length}</b></div><div className="reminder-items">{items.slice(0, 4).map((application) => <button className="reminder-item" type="button" key={application.id} onClick={() => onOpen(application)}><span><strong>{application.jobTitle}</strong><small>{application.companyName}</small></span><span className="reminder-date">{new Date(`${application.followUpDate}T00:00:00`).toLocaleDateString('vi-VN')}<ArrowRight size={14} /></span></button>)}</div></div>
}
