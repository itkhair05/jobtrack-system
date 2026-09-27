import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AnalyticsData, Application, ApplicationStatus } from '../services/applicationService'

const colors: Record<ApplicationStatus, string> = { SAVED: '#91a0b6', APPLIED: '#3774d8', INTERVIEWING: '#d69724', OFFERED: '#2e9b68', REJECTED: '#d56767' }
const labels: Record<ApplicationStatus, string> = { SAVED: 'Đã lưu', APPLIED: 'Đã ứng tuyển', INTERVIEWING: 'Phỏng vấn', OFFERED: 'Offer', REJECTED: 'Từ chối' }

export default function AnalyticsOverview({ analytics, applications = [] }: { analytics: AnalyticsData | null; applications?: Application[] }) {
  const statusData = (Object.keys(colors) as ApplicationStatus[]).map((status) => ({ name: labels[status], value: analytics?.byStatus[status] ?? 0, status })).filter((item) => item.value > 0)
  const monthData = analytics ? analytics.byMonth.slice(-6).map((item) => ({ month: `${item.month}/${String(item.year).slice(-2)}`, count: item.count })) : getMonthData(applications)
  const total = statusData.reduce((sum, item) => sum + item.value, 0)

  return <section className="analytics-panel"><header className="analytics-header"><div><p className="eyebrow">INSIGHTS</p><h2>Tiến độ ứng tuyển</h2></div><span>Dữ liệu trong danh sách hiện tại</span></header><div className="analytics-grid"><div className="chart-card"><div className="chart-title"><PieChartIcon size={17} /> Phân bổ trạng thái</div>{total ? <div className="pie-layout"><div className="pie-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3}>{statusData.map((item) => <Cell key={item.status} fill={colors[item.status]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><strong>{total}<small>đơn</small></strong></div><div className="chart-legend">{statusData.map((item) => <div key={item.status}><i style={{ background: colors[item.status] }} /> <span>{item.name}</span><b>{item.value}</b></div>)}</div></div> : <div className="chart-empty">Chưa có dữ liệu để phân tích</div>}</div><div className="chart-card"><div className="chart-title"><BarChart3 size={17} /> Nhịp ứng tuyển theo tháng</div><div className="bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf0f5" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8a95a8' }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8a95a8' }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="count" name="Đơn ứng tuyển" fill="#3157d5" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div></div></section>
}

function getMonthData(applications: Application[]) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1))
  return months.map((date) => ({ month: date.toLocaleDateString('vi-VN', { month: 'short' }).replace('.', ''), count: applications.filter((application) => { if (!application.appliedDate) return false; const applied = new Date(`${application.appliedDate}T00:00:00`); return applied.getFullYear() === date.getFullYear() && applied.getMonth() === date.getMonth() }).length }))
}
