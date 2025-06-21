import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from './ThemeProvider'
import { useLanguage } from './LanguageProvider'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // You can log to crash reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => {
  const { colors } = useTheme()
  const { t } = useLanguage()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('error.somethingWentWrong')}
        </Text>
        
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t('error.tryAgainLater')}
        </Text>
        
        {__DEV__ && error && (
          <Text style={[styles.errorDetails, { color: colors.textSecondary }]}>
            {error.message}
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={retry}
        >
          <Text style={styles.retryButtonText}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    console.error('Captured error:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
