import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { BriefcaseBusiness, CalendarDays, Link2, LoaderCircle, MapPin, X } from 'lucide-react'
import { z } from 'zod'
import CvUploader from './CvUploader'
import type { Application, ApplicationRequest } from '../services/applicationService'

const applicationSchema = z.object({
  companyName: z.string().trim().min(1, 'Nhập tên công ty').max(150, 'Tối đa 150 ký tự'),
  website: z.string().trim().max(255, 'Tối đa 255 ký tự').optional().or(z.literal('')),
  location: z.string().trim().max(150, 'Tối đa 150 ký tự').optional().or(z.literal('')),
  jobTitle: z.string().trim().min(1, 'Nhập vị trí công việc').max(150, 'Tối đa 150 ký tự'),
  jobUrl: z.string().trim().url('URL không hợp lệ').optional().or(z.literal('')),
  salaryRange: z.string().trim().max(100, 'Tối đa 100 ký tự').optional().or(z.literal('')),
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED']),
  appliedDate: z.string().optional(),
  notes: z.string().trim().max(2000, 'Tối đa 2000 ký tự').optional().or(z.literal('')),
  cvId: z.number().nullable().optional(),
  cvTitle: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof applicationSchema>

type Props = {
  application: Application | null
  onClose: () => void
  onSubmit: (payload: ApplicationRequest) => Promise<void>
}

export default function ApplicationModal({ application, onClose, onSubmit }: Props) {
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { status: 'SAVED', cvId: null, cvTitle: null },
  })

  useEffect(() => {
    reset({
      companyName: application?.companyName ?? '', website: application?.website ?? '', location: application?.location ?? '',
      jobTitle: application?.jobTitle ?? '', jobUrl: application?.jobUrl ?? '', salaryRange: application?.salaryRange ?? '',
      status: application?.status ?? 'SAVED', appliedDate: application?.appliedDate ?? '', notes: application?.notes ?? '',
      cvId: application?.cvId ?? null, cvTitle: application?.cvTitle ?? null,
    })
  }, [application, reset])

  const submit = async (values: FormValues) => {
    setSubmitError('')
    try { await onSubmit(values) } catch { setSubmitError('Không thể lưu đơn ứng tuyển. Vui lòng thử lại.') }
  }

  const selectedCvId = useWatch({ control, name: 'cvId' }) ?? null
  const selectedCvTitle = useWatch({ control, name: 'cvTitle' }) ?? null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-panel application-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title">
        <header className="modal-header"><div><p className="eyebrow">APPLICATION DETAILS</p><h2 id="application-modal-title">{application ? 'Chỉnh sửa đơn' : 'Thêm đơn ứng tuyển'}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Đóng modal"><X size={20} /></button></header>
        {submitError && <p className="modal-error">{submitError}</p>}
        <form className="application-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="form-section-title"><BriefcaseBusiness size={16} /> Công việc</div>
          <div className="form-two-col"><Field label="Tên công ty" error={errors.companyName?.message} required><input placeholder="Ví dụ: ACME Inc." {...register('companyName')} /></Field><Field label="Vị trí" error={errors.jobTitle?.message} required><input placeholder="Ví dụ: Product Designer" {...register('jobTitle')} /></Field></div>
          <div className="form-two-col"><Field label="Website" error={errors.website?.message}><input placeholder="https://company.com" {...register('website')} /></Field><Field label="Địa điểm" error={errors.location?.message}><div className="field-with-icon"><MapPin size={16} /><input placeholder="Hà Nội / Remote" {...register('location')} /></div></Field></div>
          <div className="form-two-col"><Field label="Link tuyển dụng" error={errors.jobUrl?.message}><div className="field-with-icon"><Link2 size={16} /><input placeholder="https://..." {...register('jobUrl')} /></div></Field><Field label="Mức lương" error={errors.salaryRange?.message}><input placeholder="20 - 30 triệu" {...register('salaryRange')} /></Field></div>
          <div className="form-two-col"><Field label="Trạng thái" error={errors.status?.message}><select {...register('status')}><option value="SAVED">Đã lưu</option><option value="APPLIED">Đã ứng tuyển</option><option value="INTERVIEWING">Phỏng vấn</option><option value="OFFERED">Đã nhận offer</option><option value="REJECTED">Từ chối</option></select></Field><Field label="Ngày ứng tuyển" error={errors.appliedDate?.message}><div className="field-with-icon"><CalendarDays size={16} /><input type="date" {...register('appliedDate')} /></div></Field></div>
          <Field label="Ghi chú" error={errors.notes?.message}><textarea rows={3} placeholder="Thêm ghi chú cho đơn ứng tuyển..." {...register('notes')} /></Field>
          <CvUploader cvId={selectedCvId} cvTitle={selectedCvTitle} onUploaded={(cv) => { setValue('cvId', cv?.id ?? null, { shouldDirty: true }); setValue('cvTitle', cv?.title ?? null, { shouldDirty: true }) }} />
          <footer className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Hủy</button><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : application ? 'Lưu thay đổi' : 'Thêm đơn ứng tuyển'}</button></footer>
        </form>
      </section>
    </div>
  )
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return <label className="modal-field"><span>{label}{required && <b> *</b>}</span>{children}{error && <small>{error}</small>}</label>
}
