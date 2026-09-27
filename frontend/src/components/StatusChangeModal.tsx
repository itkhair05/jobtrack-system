import { useEffect, useState } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'
import type { Application, ApplicationStatus } from '../services/applicationService'
import StatusBadge from './StatusBadge'

const statuses: ApplicationStatus[] = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED']

export default function StatusChangeModal({ application, onClose, onSubmit }: { application: Application; onClose: () => void; onSubmit: (status: ApplicationStatus, note: string) => Promise<void> }) {
  const [status, setStatus] = useState(application.status)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = async () => {
    setIsSubmitting(true); setError('')
    try { await onSubmit(status, note); onClose() } catch { setError('Không thể cập nhật trạng thái. Vui lòng thử lại.'); setIsSubmitting(false) }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal-panel status-modal" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
      <header className="modal-header"><div><p className="eyebrow">QUICK UPDATE</p><h2 id="status-modal-title">Đổi trạng thái</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Đóng modal"><X size={20} /></button></header>
      <p className="status-context">{application.jobTitle} <span>tại {application.companyName}</span></p>
      <div className="current-status"><span>Hiện tại</span><StatusBadge status={application.status} /></div>
      <div className="status-options" role="radiogroup" aria-label="Trạng thái mới">{statuses.map((item) => <button key={item} className={`status-option ${status === item ? 'selected' : ''}`} type="button" onClick={() => setStatus(item)} aria-pressed={status === item}><StatusBadge status={item} />{status === item && <Check size={16} />}</button>)}</div>
      <label className="modal-field"><span>Ghi chú ngắn</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: Đã gửi email follow-up..." /></label>
      {error && <p className="modal-error">{error}</p>}
      <footer className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Hủy</button><button className="primary-button" type="button" disabled={isSubmitting} onClick={submit}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : 'Cập nhật trạng thái'}</button></footer>
    </section>
  </div>
}
