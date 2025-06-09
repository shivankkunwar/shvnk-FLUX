import React, { useEffect, useState, useRef } from 'react'

interface ProgressModalProps {
  runId: string
  onDone: (videoPath: string) => void
  engine?: 'p5' | 'manim'
  logs: string[]
}

const ProgressModalSimple: React.FC<ProgressModalProps> = ({ runId, onDone, engine = 'p5', logs }) => {
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())
  const logContainerRef = useRef<HTMLDivElement>(null)
  const completionChecked = useRef(false)

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Simple completion detection - only check once
  useEffect(() => {
    if (completionChecked.current || logs.length === 0) return

    const allLogs = logs.join(' ').toLowerCase()
    
    // Check for errors
    const hasError = logs.some(log => {
      const lowLog = log.toLowerCase()
      return (lowLog.includes('error') || lowLog.includes('failed')) && 
             !log.includes('Animation') // Exclude progress messages
    })

    // Check for completion
    const isComplete = allLogs.includes('video') && 
                      (allLogs.includes('saved') || allLogs.includes('complete') || allLogs.includes('generated'))

    if (hasError) {
      setError(logs.find(log => log.toLowerCase().includes('error')) || 'Unknown error')
      setStatus('error')
    } else if (isComplete && logs.length > 5) { // Wait for some logs before assuming completion
      setStatus('completed')
      completionChecked.current = true
      
      setTimeout(() => {
        onDone('video-generated')
      }, 1000) // Give user time to see completion
    }
  }, [logs, onDone])

  const getElapsedTime = () => {
    const elapsed = Date.now() - startTime
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getLogColor = (log: string) => {
    const logLower = log.toLowerCase()
    
    if (log.includes('Animation') && (log.includes('%|') || log.includes('it/s'))) {
      return '#60A5FA' // Blue for progress
    }
    
    if (logLower.includes('error') || logLower.includes('failed')) {
      return '#EF4444' // Red for errors
    }
    
    if (logLower.includes('complete') || logLower.includes('success') || logLower.includes('saved')) {
      return '#10B981' // Green for success
    }
    
    return '#9CA3AF' // Default gray
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '800px',
        height: '70%',
        maxHeight: '600px',
        background: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 0.75rem 0'
          }}>
            Generating Video with {engine === 'manim' ? 'Manim' : 'P5.js'}
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: status === 'error' ? '#EF4444' : 
                         status === 'completed' ? '#10B981' : '#007AFF',
              animation: status === 'processing' ? 'pulse 2s ease-in-out infinite' : 'none'
            }} />
            <span style={{
              color: status === 'error' ? '#EF4444' : 
                     status === 'completed' ? '#10B981' : '#9CA3AF',
              fontWeight: '500'
            }}>
              {status === 'processing' && `Processing • ${getElapsedTime()}`}
              {status === 'completed' && 'Completed Successfully!'}
              {status === 'error' && 'Error Occurred'}
            </span>
          </div>
        </div>

        {/* Log Console */}
        <div style={{ flex: 1, padding: '1rem 2rem', display: 'flex', flexDirection: 'column' }}>
          <div 
            ref={logContainerRef}
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
              fontSize: '0.8rem',
              lineHeight: '1.4',
              overflowY: 'auto',
              overflowX: 'hidden',
              border: '1px solid rgba(55, 65, 81, 0.2)',
              scrollBehavior: 'smooth'
            }}
          >
            {logs.length === 0 && (
              <div style={{ color: '#6B7280', fontStyle: 'italic' }}>
                Initializing render process...
              </div>
            )}
            {logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  color: getLogColor(log),
                  marginBottom: '0.25rem',
                  wordBreak: 'break-word'
                }}
              >
                <span style={{ color: '#6B7280', marginRight: '0.5rem' }}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            margin: '0 2rem 1rem 2rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: '#EF4444',
            fontSize: '0.9rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error Details
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(status === 'error' || status === 'completed') && (
          <div style={{ 
            padding: '1rem 2rem 2rem 2rem',
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '0.75rem' 
          }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: status === 'error' ? '#EF4444' : '#10B981',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {status === 'error' ? 'Try Again' : 'Create Another'}
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.1); 
              opacity: 0.8; 
            }
          }
        `}
      </style>
    </div>
  )
}

export default ProgressModalSimple 