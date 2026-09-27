import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, BriefcaseBusiness, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errorMessage'

const loginSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginForm) => {
    setServerError('')
    try {
      await login(values)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Email hoặc mật khẩu không chính xác.'))
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="brand-mark"><BriefcaseBusiness size={20} strokeWidth={2.5} /></div>
        <span className="brand-name">JobTrack</span>
        <div className="brand-copy">
          <p className="eyebrow">YOUR NEXT MOVE, ORGANIZED</p>
          <h1>Make every application<br /><em>count.</em></h1>
          <p className="brand-description">Một nơi gọn gàng để theo dõi hành trình nghề nghiệp và tiến gần hơn đến công việc bạn muốn.</p>
        </div>
        <div className="brand-footer"><span className="footer-dot" /> Built for focused job seekers</div>
      </section>

      <section className="auth-form-panel">
        <div className="mobile-brand"><div className="brand-mark"><BriefcaseBusiness size={18} /></div><span>JobTrack</span></div>
        <div className="form-wrap">
          <div className="form-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Đăng nhập</h2>
            <p>Tiếp tục hành trình tìm việc của bạn.</p>
          </div>

          {serverError && <div className="form-alert" role="alert"><AlertCircle size={18} />{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="field-label" htmlFor="email">Email</label>
            <div className={`input-wrap ${errors.email ? 'has-error' : ''}`}>
              <Mail size={18} /><input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
            </div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}

            <label className="field-label" htmlFor="password">Mật khẩu</label>
            <div className={`input-wrap ${errors.password ? 'has-error' : ''}`}>
              <LockKeyhole size={18} /><input id="password" type="password" placeholder="Nhập mật khẩu" autoComplete="current-password" {...register('password')} />
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <>Đăng nhập <ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="switch-auth">Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link></p>
        </div>
        <p className="legal-copy">Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của JobTrack.</p>
      </section>
    </main>
  )
}
