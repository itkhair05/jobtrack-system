import { useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import AnalyticsOverview from '../components/AnalyticsOverview'
import { getAnalytics, type AnalyticsData } from '../services/applicationService'
import { getErrorMessage } from '../utils/errorMessage'

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getAnalytics()
        if (active) setAnalytics(data)
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError, 'Không thể tải dữ liệu thống kê.'))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [reloadKey])

  const refresh = () => setReloadKey((current) => current + 1)

  return (
    <main className="dashboard-shell">
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">ANALYTICS & INSIGHTS</p>
            <h1>Thống kê & Phân tích</h1>
            <p>Tổng quan về tiến độ và kết quả ứng tuyển theo thời gian.</p>
          </div>
          <button className="icon-button" type="button" onClick={refresh} aria-label="Tải lại thống kê">
            <RefreshCw size={18} />
          </button>
        </div>

        {error && <div className="settings-error">{error}</div>}

        {isLoading ? (
          <div className="detail-loading" style={{ minHeight: '300px' }}>
            <LoaderCircle className="spin" size={26} />
            <span>Đang tải biểu đồ thống kê...</span>
          </div>
        ) : (
          <AnalyticsOverview analytics={analytics} />
        )}
      </section>
    </main>
  )
}
