import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type Props = { message: string; type?: 'success' | 'error'; onClose: () => void }

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  return <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'}><span className="toast-icon">{type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}</span><span>{message}</span><button type="button" onClick={onClose} aria-label="Đóng thông báo"><X size={16} /></button></div>
}
