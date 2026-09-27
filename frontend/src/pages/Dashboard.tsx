import { useEffect, useState } from 'react'
import { AlertCircle, BriefcaseBusiness, ChevronLeft, ChevronRight, ClipboardList, Edit3, LoaderCircle, LogOut, MoreHorizontal, Plus, RefreshCw, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ApplicationModal from '../components/ApplicationModal'
import StatusBadge from '../components/StatusBadge'
import StatusChangeModal from '../components/StatusChangeModal'
import { createApplication, deleteApplication, getApplications, updateApplication, updateStatus, type Application, type ApplicationRequest, type ApplicationStatus } from '../services/applicationService'
import { getErrorMessage } from '../utils/errorMessage'

const statuses: Array<{ value: ApplicationStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' }, { value: 'SAVED', label: 'Đã lưu' }, { value: 'APPLIED', label: 'Đã ứng tuyển' },
  { value: 'INTERVIEWING', label: 'Phỏng vấn' }, { value: 'OFFERED', label: 'Đã nhận offer' }, { value: 'REJECTED', label: 'Từ chối' },
]
const statItems: Array<{ value: ApplicationStatus; label: string; className: string }> = [
  { value: 'SAVED', label: 'Đã lưu', className: 'stat-saved' }, { value: 'APPLIED', label: 'Đã ứng tuyển', className: 'stat-applied' },
  { value: 'INTERVIEWING', label: 'Phỏng vấn', className: 'stat-interviewing' }, { value: 'OFFERED', label: 'Offer', className: 'stat-offered' }, { value: 'REJECTED', label: 'Từ chối', className: 'stat-rejected' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Record<ApplicationStatus, number>>({ SAVED: 0, APPLIED: 0, INTERVIEWING: 0, OFFERED: 0, REJECTED: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [editing, setEditing] = useState<Application | null | undefined>(undefined)
  const [changingStatus, setChangingStatus] = useState<Application | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0) }, 280)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setIsLoading(true); setError('')
      try {
        const [result, ...summary] = await Promise.all([
          getApplications({ page, size: 8, status, search }),
          ...statItems.map((item) => getApplications({ page: 0, size: 1, status: item.value })),
        ])
        if (!active) return
        setApplications(result.content); setTotal(result.totalElements); setTotalPages(result.totalPages)
        setStats({ SAVED: summary[0].totalElements, APPLIED: summary[1].totalElements, INTERVIEWING: summary[2].totalElements, OFFERED: summary[3].totalElements, REJECTED: summary[4].totalElements })
      } catch (requestError) { if (active) setError(getErrorMessage(requestError, 'Không thể tải danh sách ứng tuyển.')) }
      finally { if (active) setIsLoading(false) }
    }
    load()
    return () => { active = false }
  }, [page, search, status, user, reloadKey])

  if (!user) return <Navigate to="/login" replace />

  const refresh = () => setReloadKey((current) => current + 1)
  const handleSaved = async (payload: ApplicationRequest) => {
    if (editing) await updateApplication(editing.id, payload)
    else await createApplication(payload)
    setEditing(undefined); setNotice(editing ? 'Đã cập nhật đơn ứng tuyển.' : 'Đã thêm đơn ứng tuyển.')
    refresh()
  }
  const handleDelete = async (application: Application) => {
    if (!window.confirm(`Xóa đơn ứng tuyển tại ${application.companyName}?`)) return
    try { await deleteApplication(application.id); setNotice('Đã xóa đơn ứng tuyển.'); if (applications.length === 1 && page > 0) setPage(page - 1); else refresh() }
    catch (requestError) { setError(getErrorMessage(requestError, 'Không thể xóa đơn ứng tuyển.')) }
  }
  const handleStatus = async (nextStatus: ApplicationStatus, note: string) => {
    if (!changingStatus) return
    await updateStatus(changingStatus.id, { status: nextStatus, note })
    setChangingStatus(null); setNotice('Đã cập nhật trạng thái.'); refresh()
  }

  return <main className="dashboard-shell">
    <header className="dashboard-topbar"><div className="dashboard-brand"><span className="brand-mark"><BriefcaseBusiness size={18} /></span><span>JobTrack</span></div><div className="dashboard-user"><span className="avatar">{(user.fullName || user.email)[0].toUpperCase()}</span><div><b>{user.fullName || 'Người dùng'}</b><small>{user.email}</small></div><button className="icon-button topbar-logout" type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }} aria-label="Đăng xuất"><LogOut size={18} /></button></div></header>
    <section className="dashboard-content">
      <div className="dashboard-heading"><div><p className="eyebrow">APPLICATION WORKSPACE</p><h1>Đơn ứng tuyển</h1><p>Giữ mọi cơ hội trong tầm mắt, từng bước một.</p></div><button className="primary-button add-button" type="button" onClick={() => setEditing(null)}><Plus size={18} /> Thêm đơn mới</button></div>
      <div className="stats-row"><div className="total-stat"><span className="stat-icon"><ClipboardList size={20} /></span><div><small>Tổng số đơn</small><strong>{Object.values(stats).reduce((sum, value) => sum + value, 0)}</strong></div></div>{statItems.map((item) => <div className={`status-stat ${item.className}`} key={item.value}><small>{item.label}</small><strong>{stats[item.value]}</strong></div>)}</div>
      <div className="list-toolbar"><div className="search-box"><Search size={18} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm theo công ty hoặc vị trí..." aria-label="Tìm kiếm đơn ứng tuyển" /></div><div className="filter-select"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => { setStatus(event.target.value as ApplicationStatus | ''); setPage(0) }} aria-label="Lọc theo trạng thái">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><button className="refresh-button" type="button" onClick={refresh} aria-label="Tải lại danh sách"><RefreshCw size={17} /></button></div>
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
      {error && <div className="dashboard-error" role="alert"><AlertCircle size={18} />{error}</div>}
      <section className="application-list" aria-live="polite">
        <div className="list-header"><span>Công ty & vị trí</span><span>Trạng thái</span><span>Ngày ứng tuyển</span><span aria-hidden="true"></span></div>
        {isLoading ? <div className="loading-state"><LoaderCircle className="spin" size={24} /><span>Đang tải danh sách...</span></div> : applications.length === 0 ? <div className="empty-state"><ClipboardList size={34} /><h3>Chưa có đơn ứng tuyển</h3><p>Thêm cơ hội đầu tiên để bắt đầu theo dõi hành trình của bạn.</p><button className="primary-button" type="button" onClick={() => setEditing(null)}><Plus size={17} /> Thêm đơn mới</button></div> : applications.map((application) => <article className="application-row" key={application.id}><div className="company-cell"><span className="company-logo">{application.companyName[0].toUpperCase()}</span><div><strong>{application.companyName}</strong><span>{application.jobTitle}</span>{application.location && <small>{application.location}</small>}</div></div><div><StatusBadge status={application.status} /></div><div className="date-cell">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div><div className="row-actions"><button className="icon-button" type="button" onClick={() => setEditing(application)} aria-label={`Sửa ${application.jobTitle}`}><Edit3 size={17} /></button><button className="icon-button" type="button" onClick={() => setChangingStatus(application)} aria-label={`Đổi trạng thái ${application.jobTitle}`}><MoreHorizontal size={18} /></button><button className="icon-button danger-icon" type="button" onClick={() => handleDelete(application)} aria-label={`Xóa ${application.jobTitle}`}><Trash2 size={17} /></button></div></article>)}
      </section>
      {totalPages > 0 && <footer className="pagination"><span>Hiển thị {applications.length ? page * 8 + 1 : 0}-{Math.min(page * 8 + applications.length, total)} trên {total} đơn</span><div><button className="page-button" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} aria-label="Trang trước"><ChevronLeft size={17} /></button><span className="page-number">{page + 1} / {totalPages}</span><button className="page-button" type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} aria-label="Trang sau"><ChevronRight size={17} /></button></div></footer>}
    </section>
    {editing !== undefined && <ApplicationModal application={editing} onClose={() => setEditing(undefined)} onSubmit={handleSaved} />}
    {changingStatus && <StatusChangeModal application={changingStatus} onClose={() => setChangingStatus(null)} onSubmit={handleStatus} />}
  </main>
}
