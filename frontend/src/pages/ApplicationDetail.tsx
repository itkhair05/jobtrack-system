import { useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, Download, Eye, FileText, LoaderCircle, MapPin, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import StatusChangeModal from '../components/StatusChangeModal'
import { getApplication, updateStatus, type Application, type ApplicationDetail as ApplicationDetailData, type ApplicationStatus } from '../services/applicationService'
import { getErrorMessage } from '../utils/errorMessage'
import { downloadCv, viewCv } from '../services/cvService'

const statusLabels: Record<ApplicationStatus, string> = { SAVED: 'Đã lưu', APPLIED: 'Đã ứng tuyển', INTERVIEWING: 'Phỏng vấn', OFFERED: 'Đã nhận offer', REJECTED: 'Từ chối' }

export default function ApplicationDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState<ApplicationDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingStatus, setChangingStatus] = useState<Application | null>(null)
  const [cvError, setCvError] = useState('')

  useEffect(() => {
    if (!id || !user) return
    let active = true
    const load = async () => {
      setIsLoading(true)
      try { const data = await getApplication(Number(id)); if (active) setDetail(data) }
      catch (requestError) { if (active) setError(getErrorMessage(requestError, 'Không thể tải chi tiết đơn ứng tuyển.')) }
      finally { if (active) setIsLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [id])

  if (isLoading) return <main className="detail-loading"><LoaderCircle className="spin" size={26} /> Đang tải chi tiết...</main>
  if (error || !detail) return <main className="detail-loading"><p>{error || 'Không tìm thấy đơn ứng tuyển.'}</p><button className="secondary-button" type="button" onClick={() => navigate('/')}>Về Dashboard</button></main>

  const application = detail.application
  const reload = async () => setDetail(await getApplication(application.id))
  const handleStatus = async (status: ApplicationStatus, note: string) => { await updateStatus(application.id, { status, note }); setChangingStatus(null); await reload() }
  const followUpState = getFollowUpState(application.followUpDate)
  const handleCvAction = async (action: 'view' | 'download') => {
    if (!application.cvId) return
    setCvError('')
    try { if (action === 'view') await viewCv(application.cvId); else await downloadCv(application.cvId, application.cvTitle || 'cv.pdf') }
    catch (requestError) { setCvError(getErrorMessage(requestError, 'Không thể mở CV.')) }
  }

  return <main className="detail-shell">
    <section className="detail-content">
      <div className="subpage-nav-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="back-button" type="button" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <button className="icon-button" type="button" onClick={() => void reload()} aria-label="Tải lại đơn ứng tuyển">
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="detail-heading"><div><p className="eyebrow">APPLICATION DETAIL</p><h1>{application.jobTitle}</h1><p className="detail-company"><BriefcaseBusiness size={16} /> {application.companyName}{application.location && <><span>·</span><MapPin size={15} /> {application.location}</>}</p></div><div className="detail-actions"><button className="secondary-button" type="button" onClick={() => setChangingStatus(application)}><Clock3 size={16} /> Đổi trạng thái</button><StatusBadge status={application.status} /></div></div>
      <div className="detail-grid">
        <section className="detail-main">
          <div className="detail-card"><div className="detail-card-title"><CalendarDays size={17} /> Tổng quan</div><div className="detail-facts"><Fact label="Ngày ứng tuyển" value={formatDate(application.appliedDate) || 'Chưa cập nhật'} /><Fact label="Follow-up" value={formatDate(application.followUpDate) || 'Chưa đặt'} tone={followUpState.tone}>{followUpState.label}</Fact><Fact label="Mức lương" value={application.salaryRange || 'Chưa cập nhật'} /></div></div>
          <div className="detail-card"><div className="detail-card-title"><FileText size={17} /> Ghi chú</div><p className="detail-notes">{application.notes || 'Chưa có ghi chú cho đơn ứng tuyển này.'}</p></div>
          {application.cvId && <div className="detail-card cv-detail"><div className="detail-card-title"><FileText size={17} /> CV đã sử dụng</div><div><strong>{application.cvTitle || 'CV đính kèm'}</strong><span className="cv-detail-actions"><button type="button" onClick={() => void handleCvAction('view')}><Eye size={14} /> Xem</button><button type="button" onClick={() => void handleCvAction('download')}><Download size={14} /> Tải xuống</button></span></div>{cvError && <small className="cv-upload-error">{cvError}</small>}</div>}
        </section>
        <aside className="timeline-card"><div className="detail-card-title"><Clock3 size={17} /> Lịch sử trạng thái</div><div className="timeline">{detail.timeline.map((item) => <div className="timeline-item" key={item.id}><span className="timeline-dot" /><div><div className="timeline-meta"><strong>{statusLabels[item.toStatus]}</strong><time>{new Date(item.changedAt).toLocaleString('vi-VN')}</time></div>{item.note && <p>{item.note}</p>}</div></div>)}</div></aside>
      </div>
    </section>
    {changingStatus && <StatusChangeModal application={changingStatus} onClose={() => setChangingStatus(null)} onSubmit={handleStatus} />}
  </main>
}

function Fact({ label, value, tone, children }: { label: string; value: string; tone?: string; children?: string }) { return <div className="detail-fact"><small>{label}</small><strong className={tone || ''}>{value}</strong>{children && <em className={tone || ''}>{children}</em>}</div> }
function formatDate(value: string | null) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN') : '' }
function getFollowUpState(value: string | null) { if (!value) return { tone: '', label: '' }; const date = new Date(`${value}T00:00:00`); const today = new Date(); today.setHours(0, 0, 0, 0); return date < today ? { tone: 'overdue', label: 'Đã quá hạn' } : { tone: 'upcoming', label: 'Sắp tới' } }
