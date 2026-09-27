import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, BriefcaseBusiness, Check, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errorMessage'

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ và tên').max(100, 'Tên không được quá 100 ký tự'),
  email: z.string().trim().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp', path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const { user, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: RegisterForm) => {
    setServerError('')
    try {
      await registerUser({ email: values.email, password: values.password, fullName: values.fullName })
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Không thể tạo tài khoản. Vui lòng thử lại.'))
    }
  }

  return (
    <main className="auth-shell register-shell">
      <section className="auth-brand-panel">
        <div className="brand-mark"><BriefcaseBusiness size={20} strokeWidth={2.5} /></div>
        <span className="brand-name">JobTrack</span>
        <div className="brand-copy">
          <p className="eyebrow">START WITH CLARITY</p>
          <h1>Your job search,<br /><em>in motion.</em></h1>
          <p className="brand-description">Tạo không gian riêng để biến những cơ hội rời rạc thành một kế hoạch rõ ràng.</p>
        </div>
        <ul className="benefit-list"><li><Check size={16} /> Theo dõi mọi đơn ứng tuyển</li><li><Check size={16} /> Không bỏ lỡ bước tiếp theo</li><li><Check size={16} /> Tập trung vào cơ hội phù hợp</li></ul>
      </section>

      <section className="auth-form-panel">
        <div className="mobile-brand"><div className="brand-mark"><BriefcaseBusiness size={18} /></div><span>JobTrack</span></div>
        <div className="form-wrap">
          <div className="form-heading"><p className="eyebrow">CREATE YOUR ACCOUNT</p><h2>Bắt đầu thôi</h2><p>Tạo tài khoản miễn phí trong vài giây.</p></div>
          {serverError && <div className="form-alert" role="alert"><AlertCircle size={18} />{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="field-label" htmlFor="fullName">Họ và tên</label>
            <div className={`input-wrap ${errors.fullName ? 'has-error' : ''}`}><UserRound size={18} /><input id="fullName" placeholder="Nguyễn Văn A" autoComplete="name" {...register('fullName')} /></div>
            {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
            <label className="field-label" htmlFor="email">Email</label>
            <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}><Mail size={18} /><input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} /></div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
            <div className="field-grid">
              <div><label className="field-label" htmlFor="password">Mật khẩu</label><div className={`input-wrap ${errors.password ? 'has-error' : ''}`}><LockKeyhole size={18} /><input id="password" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" {...register('password')} /></div>{errors.password && <p className="field-error">{errors.password.message}</p>}</div>
              <div><label className="field-label" htmlFor="confirmPassword">Xác nhận</label><div className={`input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}><LockKeyhole size={18} /><input id="confirmPassword" type="password" placeholder="Nhập lại" autoComplete="new-password" {...register('confirmPassword')} /></div>{errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}</div>
            </div>
            <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={18} /> : <>Tạo tài khoản <ArrowRight size={18} /></>}</button>
          </form>
          <p className="switch-auth">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
        <p className="legal-copy">Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của JobTrack.</p>
      </section>
    </main>
  )
}
