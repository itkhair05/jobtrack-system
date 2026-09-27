import { CheckCircle2, CircleDot, Clock3, FileText, XCircle } from 'lucide-react'
import type { ApplicationStatus } from '../services/applicationService'

const statusConfig: Record<ApplicationStatus, { label: string; className: string; icon: typeof FileText }> = {
  SAVED: { label: 'Đã lưu', className: 'status-saved', icon: FileText },
  APPLIED: { label: 'Đã ứng tuyển', className: 'status-applied', icon: CircleDot },
  INTERVIEWING: { label: 'Phỏng vấn', className: 'status-interviewing', icon: Clock3 },
  OFFERED: { label: 'Đã nhận offer', className: 'status-offered', icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối', className: 'status-rejected', icon: XCircle },
}

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return <span className={`status-badge ${config.className}`}><Icon size={14} aria-hidden="true" />{config.label}</span>
}

