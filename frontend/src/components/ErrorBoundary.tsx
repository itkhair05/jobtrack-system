import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('JobTrack UI error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="detail-loading"><AlertTriangle size={30} /><h2>Đã xảy ra lỗi giao diện</h2><p>Vui lòng tải lại trang để tiếp tục.</p><button className="primary-button" type="button" onClick={() => window.location.reload()}><RefreshCw size={16} /> Tải lại trang</button></main>
  }
}
