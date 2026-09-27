import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, LockKeyhole, Mail, Save, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errorMessage'
import { updateProfile } from '../services/userService'

const settingsSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự').max(100, 'Tối đa 100 ký tự'),
  email: z.string().trim().email('Email không hợp lệ'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.newPassword || data.newPassword.length >= 8, { message: 'Mật khẩu mới cần ít nhất 8 ký tự', path: ['newPassword'] })
  .refine((data) => data.newPassword === data.confirmPassword, { message: 'Mật khẩu xác nhận không khớp', path: ['confirmPassword'] })

type FormValues = z.infer<typeof settingsSchema>

export default function Settings() {
  const { user, updateSession } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(settingsSchema), defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '', currentPassword: '', newPassword: '', confirmPassword: '' } })

  if (!user) { navigate('/login', { replace: true }); return null }

  const onSubmit = async (values: FormValues) => {
    setServerError(''); setNotice('')
    try {
      const updated = await updateProfile({ email: values.email, fullName: values.fullName, ...(values.newPassword ? { currentPassword: values.currentPassword, newPassword: values.newPassword } : {}) })
      updateSession(updated); setNotice('Thông tin tài khoản đã được cập nhật.')
    } catch (error) { setServerError(getErrorMessage(error, 'Không thể cập nhật thông tin.')) }
  }

  return <main className="settings-shell"><header className="settings-topbar"><button className="back-button" type="button" onClick={() => navigate('/')}><ArrowLeft size={18} /> Dashboard</button><div className="dashboard-brand"><span className="brand-mark"><UserRound size={18} /></span><span>Thiết lập tài khoản</span></div><span className="settings-spacer" /></header><section className="settings-content"><div className="settings-heading"><p className="eyebrow">ACCOUNT SETTINGS</p><h1>Thông tin cá nhân</h1><p>Quản lý thông tin và bảo mật tài khoản JobTrack.</p></div><form className="settings-form" onSubmit={handleSubmit(onSubmit)} noValidate><section className="settings-card"><div className="settings-card-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h2>Thông tin cơ bản</h2><p>Cập nhật thông tin hiển thị của bạn.</p></div></div><div className="settings-fields"><Field label="Họ và tên" error={errors.fullName?.message}><div className="settings-input"><UserRound size={16} /><input {...register('fullName')} /></div></Field><Field label="Email" error={errors.email?.message}><div className="settings-input"><Mail size={16} /><input type="email" {...register('email')} /></div></Field></div></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-icon settings-lock"><LockKeyhole size={18} /></span><div><h2>Đổi mật khẩu</h2><p>Để trống nếu bạn không muốn thay đổi mật khẩu.</p></div></div><div className="settings-fields"><Field label="Mật khẩu hiện tại" error={errors.currentPassword?.message}><div className="settings-input"><LockKeyhole size={16} /><input type="password" autoComplete="current-password" {...register('currentPassword')} /></div></Field><div /><Field label="Mật khẩu mới" error={errors.newPassword?.message}><div className="settings-input"><LockKeyhole size={16} /><input type="password" autoComplete="new-password" {...register('newPassword')} /></div></Field><Field label="Xác nhận mật khẩu mới" error={errors.confirmPassword?.message}><div className="settings-input"><LockKeyhole size={16} /><input type="password" autoComplete="new-password" {...register('confirmPassword')} /></div></Field></div></section>{serverError && <div className="settings-error">{serverError}</div>}{notice && <div className="settings-notice"><Check size={17} />{notice}</div>}<div className="settings-actions"><button className="secondary-button" type="button" onClick={() => navigate('/')}>Hủy</button><button className="primary-button" type="submit" disabled={isSubmitting}><Save size={17} />{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div></form></section></main>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="settings-field"><span>{label}</span>{children}{error && <small>{error}</small>}</label> }
