import { useRef, useState } from 'react'
import { CheckCircle2, FileText, LoaderCircle, UploadCloud, X } from 'lucide-react'
import { uploadCv, type Cv } from '../services/applicationService'

type Props = {
  cvId: number | null
  cvTitle: string | null
  onUploaded: (cv: Cv | null) => void
}

export default function CvUploader({ cvId, cvTitle, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file?: File) => {
    if (!file) return
    setError('')
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx'].includes(extension ?? '')) {
      setError('Chỉ hỗ trợ file PDF hoặc DOCX.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file tối đa là 10 MB.')
      return
    }
    setIsUploading(true)
    try {
      onUploaded(await uploadCv(file, file.name.replace(/\.[^/.]+$/, '')))
    } catch {
      setError('Upload thất bại. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }

  return <div className="cv-uploader">
    <span className="cv-uploader-label">CV đính kèm</span>
    {cvId && cvTitle ? <div className="cv-attached"><span className="cv-file-icon"><FileText size={17} /></span><div><strong>{cvTitle}</strong><small>Đã lưu trong JobTrack</small></div><CheckCircle2 className="cv-check" size={17} /><button type="button" className="cv-remove" onClick={() => onUploaded(null)} aria-label="Bỏ CV đã chọn"><X size={15} /></button></div> : <button type="button" className={`cv-dropzone ${isDragging ? 'is-dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); void handleFile(event.dataTransfer.files[0]) }} disabled={isUploading}><input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = '' }} />{isUploading ? <LoaderCircle className="spin" size={22} /> : <UploadCloud size={22} />}<span><b>{isUploading ? 'Đang upload...' : 'Kéo thả CV hoặc chọn file'}</b><small>PDF hoặc DOCX, tối đa 10 MB</small></span></button>}
    {error && <small className="cv-upload-error">{error}</small>}
  </div>
}
