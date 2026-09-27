import { ArrowRight, BriefcaseBusiness, Edit3, GripVertical, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { Application, ApplicationStatus } from '../services/applicationService'

const columns: Array<{ status: ApplicationStatus; title: string; color: string }> = [
  { status: 'SAVED', title: 'Đã lưu', color: 'kanban-saved' },
  { status: 'APPLIED', title: 'Đã ứng tuyển', color: 'kanban-applied' },
  { status: 'INTERVIEWING', title: 'Phỏng vấn', color: 'kanban-interviewing' },
  { status: 'OFFERED', title: 'Đã nhận offer', color: 'kanban-offered' },
  { status: 'REJECTED', title: 'Từ chối', color: 'kanban-rejected' },
]

export default function KanbanBoard({ applications, onEdit, onStatusChange, onDelete }: { applications: Application[]; onEdit: (application: Application) => void; onStatusChange: (application: Application, status: ApplicationStatus) => void; onDelete: (application: Application) => void }) {
  const moveTo = (application: Application, direction: -1 | 1) => {
    const index = columns.findIndex((column) => column.status === application.status)
    const next = columns[index + direction]
    if (next) onStatusChange(application, next.status)
  }

  return <div className="kanban-board">{columns.map((column) => {
    const items = applications.filter((application) => application.status === column.status)
    return <section className={`kanban-column ${column.color}`} key={column.status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = Number(event.dataTransfer.getData('application-id')); const application = applications.find((item) => item.id === id); if (application && application.status !== column.status) onStatusChange(application, column.status) }}><header className="kanban-column-header"><span><i />{column.title}</span><b>{items.length}</b></header><div className="kanban-cards">{items.map((application) => <article className="kanban-card" key={application.id} draggable onDragStart={(event) => event.dataTransfer.setData('application-id', String(application.id))}><div className="kanban-card-top"><GripVertical className="drag-handle" size={16} /><StatusBadge status={application.status} /></div><h3>{application.jobTitle}</h3><p><BriefcaseBusiness size={14} />{application.companyName}</p>{application.location && <small>{application.location}</small>}<footer><button type="button" onClick={() => moveTo(application, -1)} disabled={column.status === 'SAVED'} aria-label="Chuyển sang cột trước"><ArrowRight className="arrow-back" size={15} /></button><button type="button" onClick={() => onEdit(application)} aria-label="Chỉnh sửa đơn"><Edit3 size={15} /></button><button type="button" onClick={() => moveTo(application, 1)} disabled={column.status === 'REJECTED'} aria-label="Chuyển sang cột sau"><ArrowRight size={15} /></button><button type="button" className="danger-icon" onClick={() => onDelete(application)} aria-label="Xóa đơn"><Trash2 size={15} /></button></footer></article>)}</div>{items.length === 0 && <div className="kanban-empty">Kéo đơn vào đây</div>}</section>
  })}</div>
}
