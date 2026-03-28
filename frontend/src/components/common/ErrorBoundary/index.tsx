import React from 'react'
import { AlertTriangle } from 'lucide-react'
import styles from './ErrorBoundary.module.scss'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.container} role="alert">
          <div className={styles.card}>
            <div className={styles.iconWrap}>
              <AlertTriangle size={40} className={styles.icon} />
            </div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className={styles.details}>
                <summary>Technical details</summary>
                <pre className={styles.errorText}>{this.state.error.message}</pre>
              </details>
            )}
            <div className={styles.actions}>
              <button className={styles.retryBtn} onClick={this.handleReset}>
                Try Again
              </button>
              <button
                className={styles.homeBtn}
                onClick={() => {
                  this.handleReset()
                  window.location.href = '/en/'
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
