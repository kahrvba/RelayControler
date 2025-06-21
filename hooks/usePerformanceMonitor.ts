import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  memoryWarning: boolean
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0)
  const renderTimesRef = useRef<number[]>([])
  const startTimeRef = useRef<number>(0)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryWarning: false
  })

  // Track render start
  useEffect(() => {
    startTimeRef.current = performance.now()
  })

  // Track render end and calculate metrics
  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTimeRef.current
    
    renderCountRef.current += 1
    renderTimesRef.current.push(renderTime)
    
    // Keep only last 10 render times for average calculation
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift()
    }
    
    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
    
    setMetrics({
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      averageRenderTime,
      memoryWarning: renderTime > 16.67 // 60fps threshold
    })
    
    // Log performance warnings in development
    if (__DEV__) {
      if (renderTime > 16.67) {
        console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
      
      if (renderCountRef.current % 50 === 0) {
        console.log(`📊 ${componentName} Performance:`, {
          renders: renderCountRef.current,
          avgRenderTime: averageRenderTime.toFixed(2) + 'ms',
          lastRenderTime: renderTime.toFixed(2) + 'ms'
        })
      }
    }
  })

  return metrics
}

// Hook for monitoring memory usage
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const checkMemory = () => {
      // @ts-ignore - performance.memory is available in some environments
      if (typeof performance !== 'undefined' && performance.memory) {
        // @ts-ignore
        const memory = performance.memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        })
        
        // Warn if memory usage is high
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        if (usagePercentage > 80 && __DEV__) {
          console.warn(`🚨 High memory usage: ${usagePercentage.toFixed(1)}%`)
        }
      }
    }

    const interval = setInterval(checkMemory, 5000) // Check every 5 seconds
    checkMemory() // Initial check

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Hook for debouncing values to prevent excessive re-renders
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const throttledCallback = useRef((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    } else {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now()
        callback(...args)
      }, delay - (now - lastCallRef.current))
    }
  })

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback.current as T
}
