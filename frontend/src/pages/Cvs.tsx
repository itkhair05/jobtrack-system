import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, Eye, FileText, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { uploadCv, type Cv } from '../services/applicationService'
import { deleteCv, downloadCv, getCvs, viewCv } from '../services/cvService'
import { getErrorMessage } from '../utils/errorMessage'

export default function Cvs() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [cvs, setCvs] = useState<Cv[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeFile, setActiveFile] = useState<number | null>(null)

  const load = async () => { setIsLoading(true); setError(''); try { setCvs(await getCvs()) } catch (requestError) { setError(getErrorMessage(requestError, 'Không thể tải danh sách CV.')) } finally { setIsLoading(false) } }
  useEffect(() => {
    let active = true
    getCvs().then((items) => { if (active) setCvs(items) }).catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'Không thể tải danh sách CV.')) }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const handleUpload = async (file?: File) => {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx'].includes(extension ?? '')) { setError('Chỉ hỗ trợ file PDF hoặc DOCX.'); return }
    setIsUploading(true); setError('')
    try { await uploadCv(file, file.name.replace(/\.[^/.]+$/, '')); setNotice('Đã upload CV mới.'); await load() } catch (requestError) { setError(getErrorMessage(requestError, 'Không thể upload CV.')) } finally { setIsUploading(false) }
  }
  const handleDelete = async (cv: Cv) => {
    if (!window.confirm(`Xóa CV "${cv.title}"?`)) return
    try { await deleteCv(cv.id); setCvs((items) => items.filter((item) => item.id !== cv.id)); setNotice('Đã xóa CV.') } catch (requestError) { setError(getErrorMessage(requestError, 'Không thể xóa CV.')) }
  }
  const handleView = async (cv: Cv) => { setActiveFile(cv.id); setError(''); try { await viewCv(cv.id) } catch (requestError) { setError(getErrorMessage(requestError, 'Không thể mở CV.')) } finally { setActiveFile(null) } }
  const handleDownload = async (cv: Cv) => { setActiveFile(cv.id); setError(''); try { await downloadCv(cv.id, cv.fileName) } catch (requestError) { setError(getErrorMessage(requestError, 'Không thể tải CV.')) } finally { setActiveFile(null) } }

  return <main className="settings-shell">
    <section className="settings-content cvs-content">
      <button className="back-button" type="button" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        <ArrowLeft size={18} /> Quay lại
      </button>
      <div className="settings-heading"><p className="eyebrow">CV LIBRARY</p><h1>Hồ sơ CV của bạn</h1><p>Lưu nhiều phiên bản CV và chọn đúng hồ sơ cho từng cơ hội.</p></div><div className="cv-library-actions"><button className="primary-button" type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}><input ref={inputRef} type="file" accept=".pdf,.docx" hidden onChange={(event) => { void handleUpload(event.target.files?.[0]); event.target.value = '' }} />{isUploading ? <LoaderCircle className="spin" size={17} /> : <UploadCloud size={17} />} Upload CV mới</button></div>{notice && <div className="settings-notice">{notice}</div>}{error && <div className="settings-error">{error}</div>}{isLoading ? <div className="cv-loading"><LoaderCircle className="spin" size={23} /> Đang tải thư viện CV...</div> : cvs.length === 0 ? <div className="cv-empty"><FileText size={30} /><h2>Chưa có CV nào</h2><p>Upload CV đầu tiên để dùng lại trong các đơn ứng tuyển.</p></div> : <div className="cv-library-grid">{cvs.map((cv) => <article className="cv-library-card" key={cv.id}><span className="cv-library-icon"><FileText size={21} /></span><div><h2>{cv.title}</h2><p>{cv.fileName}</p><small>Upload ngày {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</small></div><div className="cv-library-actions"><button className="icon-button" type="button" onClick={() => void handleView(cv)} disabled={activeFile === cv.id} aria-label={`Xem ${cv.title}`}><Eye size={17} /></button><button className="icon-button" type="button" onClick={() => void handleDownload(cv)} disabled={activeFile === cv.id} aria-label={`Tải xuống ${cv.title}`}><Download size={17} /></button><button className="icon-button danger-icon" type="button" onClick={() => void handleDelete(cv)} aria-label={`Xóa ${cv.title}`}><Trash2 size={17} /></button></div></article>)}</div>}</section></main>
}
