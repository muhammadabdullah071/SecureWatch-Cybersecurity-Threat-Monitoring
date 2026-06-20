import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-critical-900/30 mb-4">
            <AlertTriangle className="h-8 w-8 text-critical-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 text-center max-w-md mb-6">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
