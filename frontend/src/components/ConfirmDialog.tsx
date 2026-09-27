import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><section className="modal-panel confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><button className="icon-button confirm-close" type="button" onClick={onCancel} aria-label="Đóng"><X size={18} /></button><span className="confirm-icon"><AlertTriangle size={22} /></span><h2 id="confirm-title">{title}</h2><p>{message}</p><footer className="modal-actions"><button className="secondary-button" type="button" onClick={onCancel}>Hủy</button><button className="danger-button" type="button" onClick={onConfirm}>Xóa</button></footer></section></div>
}
