import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Buttons from './Buttons'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // TODO: Send to error tracking service (Sentry, etc.)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI personnalisé
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-dvh bg-dark flex items-center justify-center p-5">
          <div className="max-w-md w-full space-y-6 text-center animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-error/20 border-2 border-error flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-10 w-10 text-error" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">
                Oups ! Une erreur est survenue
              </h1>
              <p className="text-text-secondary text-sm">
                Nous sommes désolés, quelque chose s'est mal passé.
                Essayez de rafraîchir la page ou de revenir à l'accueil.
              </p>
            </div>

            {/* Error details in dev mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="glass-effect rounded-xl p-4 border border-error/30 text-left">
                <p className="text-error text-xs font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-text-tertiary text-xs cursor-pointer hover:text-accent">
                      Stack trace
                    </summary>
                    <pre className="text-text-quaternary text-xs mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Buttons
                onClick={this.handleRetry}
                primary
                title="Réessayer"
                className="w-full shadow-neon-accent flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Réessayer</span>
              </Buttons>

              <Buttons
                onClick={this.handleGoHome}
                secondary
                title="Retour à l'accueil"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                <span>Retour à l'accueil</span>
              </Buttons>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
