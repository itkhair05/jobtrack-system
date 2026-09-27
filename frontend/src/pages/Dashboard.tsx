import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, ClipboardList, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ApplicationModal from '../components/ApplicationModal'
import StatusBadge from '../components/StatusBadge'
import ReminderCenter from '../components/ReminderCenter'
import { createApplication, getAnalytics, getApplications, getFollowUps, type Application, type ApplicationRequest, type ApplicationStatus } from '../services/applicationService'
import { getErrorMessage } from '../utils/errorMessage'
import Toast from '../components/Toast'

const statItems: Array<{ value: ApplicationStatus; label: string; className: string }> = [
  { value: 'SAVED', label: 'Đã lưu', className: 'stat-saved' },
  { value: 'APPLIED', label: 'Đã ứng tuyển', className: 'stat-applied' },
  { value: 'INTERVIEWING', label: 'Phỏng vấn', className: 'stat-interviewing' },
  { value: 'OFFERED', label: 'Offer', className: 'stat-offered' },
  { value: 'REJECTED', label: 'Từ chối', className: 'stat-rejected' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const remindersRef = useRef<HTMLDivElement>(null)
  const isRemindersTarget = new URLSearchParams(location.search).get('reminders') === '1'

  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Record<ApplicationStatus, number>>({ SAVED: 0, APPLIED: 0, INTERVIEWING: 0, OFFERED: 0, REJECTED: 0 })
  const [followUps, setFollowUps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [addingNew, setAddingNew] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true); setError('')
      try {
        const [recentApps, analyticsResult, reminders] = await Promise.all([
          getApplications({ page: 0, size: 5 }),
          getAnalytics(),
          getFollowUps(7),
        ])
        if (!active) return
        setApplications(recentApps.content)
        setStats(analyticsResult.byStatus)
        setFollowUps(reminders)
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError, 'Không thể tải tổng quan Dashboard.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [reloadKey])

  useEffect(() => {
    if (isRemindersTarget && remindersRef.current) {
      remindersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isRemindersTarget])

  if (!user) return null

  const refresh = () => setReloadKey((current) => current + 1)

  const handleSaved = async (payload: ApplicationRequest) => {
    await createApplication(payload)
    setAddingNew(false)
    setNotice('Đã thêm đơn ứng tuyển.')
    refresh()
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">DASHBOARD OVERVIEW</p>
            <h1>Hành trình ứng tuyển</h1>
            <p>Tổng quan về tiến độ công việc và các thông báo cần chú ý.</p>
          </div>
          <button className="primary-button add-button" type="button" onClick={() => setAddingNew(true)}>
            <Plus size={18} /> Thêm đơn mới
          </button>
        </div>

        <div className="stats-row">
          <div className="total-stat">
            <span className="stat-icon"><ClipboardList size={20} /></span>
            <div>
              <small>Tổng số đơn</small>
              <strong>{Object.values(stats).reduce((sum, value) => sum + value, 0)}</strong>
            </div>
          </div>
          {statItems.map((item) => (
            <div className={`status-stat ${item.className}`} key={item.value}>
              <small>{item.label}</small>
              <strong>{stats[item.value]}</strong>
            </div>
          ))}
        </div>

        {notice && <Toast message={notice} onClose={() => setNotice('')} />}
        {error && <Toast message={error} type="error" onClose={() => setError('')} />}

        <div ref={remindersRef}>
          <ReminderCenter applications={followUps} onOpen={(application) => navigate(`/applications/${application.id}`)} />
        </div>

        <section className="dashboard-recent-section" style={{ marginTop: '28px' }}>
          <div className="analytics-toolbar" style={{ marginBottom: '14px' }}>
            <span>Ứng tuyển gần đây</span>
            <button type="button" onClick={() => navigate('/applications')}>
              Xem tất cả ({Object.values(stats).reduce((sum, value) => sum + value, 0)}) <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
          </div>

          <div className="application-list" aria-live="polite">
            <div className="list-header">
              <span>Công ty & vị trí</span>
              <span>Trạng thái</span>
              <span>Ngày ứng tuyển</span>
              <span aria-hidden="true" />
            </div>
            {isLoading ? (
              <div className="skeleton-list">
                {[1, 2, 3].map((item) => (
                  <div className="skeleton-row" key={item}><span /><div /><em /><aside /></div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <BriefcaseBusiness size={34} />
                <h3>Chưa có đơn ứng tuyển nào</h3>
                <p>Thêm cơ hội đầu tiên để bắt đầu theo dõi hành trình của bạn.</p>
                <button className="primary-button" type="button" onClick={() => setAddingNew(true)}>
                  <Plus size={17} /> Thêm đơn mới
                </button>
              </div>
            ) : (
              applications.map((application) => (
                <article
                  className="application-row"
                  key={application.id}
                  onClick={() => navigate(`/applications/${application.id}`)}
                >
                  <div className="company-cell">
                    <span className="company-logo">{application.companyName[0].toUpperCase()}</span>
                    <div>
                      <strong>{application.companyName}</strong>
                      <span>{application.jobTitle}</span>
                      {application.location && <small>{application.location}</small>}
                    </div>
                  </div>
                  <div><StatusBadge status={application.status} /></div>
                  <div className="date-cell">
                    {application.followUpDate
                      ? `Follow-up ${new Date(`${application.followUpDate}T00:00:00`).toLocaleDateString('vi-VN')}`
                      : application.appliedDate
                      ? new Date(application.appliedDate).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </div>
                  <div className="row-actions">
                    <button className="icon-button" type="button" aria-label="Xem chi tiết">
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      {addingNew && (
        <ApplicationModal application={null} onClose={() => setAddingNew(false)} onSubmit={handleSaved} />
      )}
    </main>
  )
}
