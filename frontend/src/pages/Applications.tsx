import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Download, Edit3, FileSpreadsheet, KanbanSquare, MoreHorizontal, Plus, RefreshCw, Search, SlidersHorizontal, Table2, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import ApplicationModal from '../components/ApplicationModal'
import StatusBadge from '../components/StatusBadge'
import StatusChangeModal from '../components/StatusChangeModal'
import KanbanBoard from '../components/KanbanBoard'
import { createApplication, deleteApplication, getApplications, updateApplication, updateStatus, type Application, type ApplicationRequest, type ApplicationStatus } from '../services/applicationService'
import { getErrorMessage } from '../utils/errorMessage'
import { exportApplications } from '../services/exportService'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

const statuses: Array<{ value: ApplicationStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SAVED', label: 'Đã lưu' },
  { value: 'APPLIED', label: 'Đã ứng tuyển' },
  { value: 'INTERVIEWING', label: 'Phỏng vấn' },
  { value: 'OFFERED', label: 'Đã nhận offer' },
  { value: 'REJECTED', label: 'Từ chối' },
]

export default function Applications() {
  const navigate = useNavigate()
  const location = useLocation()
  const urlSearch = new URLSearchParams(location.search).get('search') ?? ''
  const [applications, setApplications] = useState<Application[]>([])
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
  const [view, setView] = useState<'table' | 'board'>('table')
  const [isExporting, setIsExporting] = useState(false)
  const [editing, setEditing] = useState<Application | null | undefined>(undefined)
  const [changingStatus, setChangingStatus] = useState<Application | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0) }, 280)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setSearchInput(urlSearch)
    setSearch(urlSearch)
    setPage(0)
  }, [urlSearch])

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true); setError('')
      try {
        const result = await getApplications({ page, size: view === 'board' ? 100 : 8, status, search })
        if (!active) return
        setApplications(result.content)
        setTotal(result.totalElements)
        setTotalPages(result.totalPages)
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError, 'Không thể tải danh sách ứng tuyển.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [page, search, status, reloadKey, view])

  const refresh = () => setReloadKey((current) => current + 1)
  const handleSaved = async (payload: ApplicationRequest) => {
    if (editing) await updateApplication(editing.id, payload)
    else await createApplication(payload)
    setEditing(undefined)
    setNotice(editing ? 'Đã cập nhật đơn ứng tuyển.' : 'Đã thêm đơn ứng tuyển.')
    refresh()
  }

  const handleDelete = async (application: Application) => {
    try {
      await deleteApplication(application.id)
      setConfirmDelete(null)
      setNotice('Đã xóa đơn ứng tuyển.')
      if (applications.length === 1 && page > 0) setPage(page - 1)
      else refresh()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể xóa đơn ứng tuyển.'))
    }
  }

  const handleStatus = async (nextStatus: ApplicationStatus, note: string) => {
    if (!changingStatus) return
    await updateStatus(changingStatus.id, { status: nextStatus, note })
    setChangingStatus(null)
    setNotice('Đã cập nhật trạng thái.')
    refresh()
  }

  const handleBoardStatus = async (application: Application, nextStatus: ApplicationStatus) => {
    try {
      await updateStatus(application.id, { status: nextStatus })
      setNotice('Đã chuyển đơn sang trạng thái mới.')
      refresh()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể đổi trạng thái.'))
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true); setError('')
    try {
      await exportApplications(format)
      setNotice(`Đã xuất file ${format.toUpperCase()}.`)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể xuất dữ liệu.'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">APPLICATION WORKSPACE</p>
            <h1>Danh sách đơn ứng tuyển</h1>
            <p>Quản lý chi tiết tất cả các cơ hội nghề nghiệp của bạn.</p>
          </div>
          <button className="primary-button add-button" type="button" onClick={() => setEditing(null)}>
            <Plus size={18} /> Thêm đơn mới
          </button>
        </div>

        <div className="list-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo công ty hoặc vị trí..."
              aria-label="Tìm kiếm đơn ứng tuyển"
            />
          </div>
          <div className="filter-select">
            <SlidersHorizontal size={16} />
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value as ApplicationStatus | ''); setPage(0) }}
              aria-label="Lọc theo trạng thái"
            >
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="view-toggle" role="group" aria-label="Chế độ hiển thị">
            <button className={view === 'table' ? 'active' : ''} type="button" onClick={() => { setView('table'); setPage(0) }}>
              <Table2 size={16} /> Bảng
            </button>
            <button className={view === 'board' ? 'active' : ''} type="button" onClick={() => { setView('board'); setPage(0) }}>
              <KanbanSquare size={16} /> Kanban
            </button>
          </div>
          <div className="export-actions">
            <button type="button" onClick={() => void handleExport('csv')} disabled={isExporting}>
              <Download size={15} /> CSV
            </button>
            <button type="button" onClick={() => void handleExport('xlsx')} disabled={isExporting}>
              <FileSpreadsheet size={15} /> Excel
            </button>
          </div>
          <button className="refresh-button" type="button" onClick={refresh} aria-label="Tải lại danh sách">
            <RefreshCw size={17} />
          </button>
        </div>

        {notice && <Toast message={notice} onClose={() => setNotice('')} />}
        {error && <Toast message={error} type="error" onClose={() => setError('')} />}

        {view === 'board' && !isLoading && (
          <KanbanBoard
            applications={applications}
            onEdit={setEditing}
            onStatusChange={handleBoardStatus}
            onDelete={handleDelete}
          />
        )}

        {view === 'table' && (
          <section className="application-list" aria-live="polite">
            <div className="list-header">
              <span>Công ty & vị trí</span>
              <span>Trạng thái</span>
              <span>Ngày ứng tuyển</span>
              <span aria-hidden="true" />
            </div>
            {isLoading ? (
              <SkeletonRows />
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={34} />
                <h3>Chưa có đơn ứng tuyển</h3>
                <p>Thêm cơ hội đầu tiên để bắt đầu theo dõi hành trình của bạn.</p>
                <button className="primary-button" type="button" onClick={() => setEditing(null)}>
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
                      <strong title={application.companyName}>{application.companyName}</strong>
                      <span title={application.jobTitle}>{application.jobTitle}</span>
                      {application.location && <small title={application.location}>{application.location}</small>}
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
                    <button
                      className="icon-button"
                      type="button"
                      onClick={(event) => { event.stopPropagation(); setEditing(application) }}
                      aria-label={`Sửa ${application.jobTitle}`}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={(event) => { event.stopPropagation(); setChangingStatus(application) }}
                      aria-label={`Đổi trạng thái ${application.jobTitle}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <button
                      className="icon-button danger-icon"
                      type="button"
                      onClick={(event) => { event.stopPropagation(); setConfirmDelete(application) }}
                      aria-label={`Xóa ${application.jobTitle}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {view === 'table' && totalPages > 0 && (
          <footer className="pagination">
            <span>Hiển thị {applications.length ? page * 8 + 1 : 0}-{Math.min(page * 8 + applications.length, total)} trên {total} đơn</span>
            <div>
              <button className="page-button" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} aria-label="Trang trước">
                <ChevronLeft size={17} />
              </button>
              <span className="page-number">{page + 1} / {totalPages}</span>
              <button className="page-button" type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} aria-label="Trang sau">
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        )}
      </section>

      {editing !== undefined && (
        <ApplicationModal application={editing} onClose={() => setEditing(undefined)} onSubmit={handleSaved} />
      )}
      {changingStatus && (
        <StatusChangeModal application={changingStatus} onClose={() => setChangingStatus(null)} onSubmit={handleStatus} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Xóa đơn ứng tuyển?"
          message={`Đơn tại ${confirmDelete.companyName} sẽ bị xóa vĩnh viễn.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => void handleDelete(confirmDelete)}
        />
      )}
    </main>
  )
}

function SkeletonRows() {
  return (
    <div className="skeleton-list" aria-label="Đang tải danh sách">
      {[1, 2, 3, 4].map((item) => (
        <div className="skeleton-row" key={item}><span /><div /><em /><aside /></div>
      ))}
    </div>
  )
}
