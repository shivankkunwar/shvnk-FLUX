import React, { useEffect, useState, useRef } from 'react'

interface ProgressModalProps {
  runId: string
  onDone: (videoPath: string) => void
}

const ProgressModal: React.FC<ProgressModalProps> = ({ runId, onDone }) => {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<'connecting' | 'processing' | 'completed' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!runId) return

    const eventSource = new EventSource(`/api/logs?runId=${runId}`)
    
    eventSource.onopen = () => {
      setStatus('processing')
    }

    eventSource.onmessage = (event) => {
      const logMessage = event.data
      setLogs(prev => [...prev, logMessage])
      
      // Check if this is an actual error message (not Manim progress)
      const isProgress = logMessage.includes('Animation') && (logMessage.includes('%|') || logMessage.includes('it/s'))
      const isActualError = (logMessage.toLowerCase().includes('error') || 
                           logMessage.toLowerCase().includes('failed') ||
                           logMessage.toLowerCase().includes('traceback')) && !isProgress
      
      if (isActualError) {
        setError(logMessage)
      }
    }

    eventSource.addEventListener('done', (event) => {
      const data = JSON.parse(event.data)
      setStatus('completed')
      if (data.videoPath) {
        onDone(data.videoPath)
      } else {
        setError('Video generation completed but no video path received')
        setStatus('error')
      }
      eventSource.close()
    })

    eventSource.onerror = () => {
      setError('Connection to server lost')
      setStatus('error')
      eventSource.close()
    }

    return () => eventSource.close()
  }, [runId, onDone])

  // Auto-scroll logs to bottom with improved timing
  useEffect(() => {
    if (logContainerRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
        }
      }, 10)
    }
  }, [logs])

  // Additional scroll to bottom when new logs are added
  useEffect(() => {
    if (logs.length > 0 && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs.length])

  const getLogColor = (log: string) => {
    const logLower = log.toLowerCase()
    
    // Manim progress messages (these are NOT errors, just progress info sent to stderr)
    if (log.includes('Animation') && (log.includes('%|') || log.includes('it/s'))) {
      return '#60A5FA' // Blue for progress
    }
    
    // Actual errors
    if (logLower.includes('traceback') || 
        logLower.includes('exception') ||
        logLower.includes('syntax error') ||
        logLower.includes('name error') ||
        logLower.includes('type error') ||
        logLower.includes('attribute error') ||
        logLower.includes('rendering failed') ||
        logLower.includes('process error')) {
      return '#EF4444' // Red for real errors
    }
    
    // Success messages
    if (logLower.includes('complete') || 
        logLower.includes('success') || 
        logLower.includes('saved') ||
        logLower.includes('found')) {
      return '#10B981' // Green
    }
    
    // Warning messages
    if (logLower.includes('warning') || logLower.includes('retry')) {
      return '#F59E0B' // Orange
    }
    
    // Engine-specific messages
    if (logLower.includes('[manim]') || logLower.includes('[p5]')) {
      return '#8B5CF6' // Purple
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
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '900px',
        height: '80%',
        maxHeight: '600px',
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 0.5rem 0'
            }}>
              Generating Video
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                background: status === 'error' ? '#EF4444' : 
                           status === 'completed' ? '#10B981' : '#3B82F6'
              }} />
              <span style={{
                color: status === 'error' ? '#EF4444' : 
                       status === 'completed' ? '#10B981' : '#9CA3AF',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {status === 'connecting' && 'Connecting...'}
                {status === 'processing' && 'Processing...'}
                {status === 'completed' && 'Completed'}
                {status === 'error' && 'Error occurred'}
              </span>
            </div>
          </div>

          {/* Abstract visualization */}
          <div style={{
            width: '120px',
            height: '80px',
            position: 'relative',
            opacity: status === 'processing' ? 1 : 0.3
          }}>
            {/* Neural network nodes */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3B82F6',
              animation: status === 'processing' ? 'pulse 2s ease-in-out infinite' : 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '60%',
              left: '25%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#8B5CF6',
              animation: status === 'processing' ? 'pulse 2s ease-in-out infinite 0.5s' : 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: '40%',
              right: '20%',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10B981',
              animation: status === 'processing' ? 'pulse 2s ease-in-out infinite 1s' : 'none'
            }} />
            
            {/* Connecting lines */}
            <svg style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%'
            }}>
              <line 
                x1="20%" y1="30%" 
                x2="35%" y2="70%" 
                stroke="rgba(59, 130, 246, 0.3)" 
                strokeWidth="1"
                style={{
                  animation: status === 'processing' ? 'glow 3s ease-in-out infinite' : 'none'
                }}
              />
              <line 
                x1="35%" y1="70%" 
                x2="80%" y2="50%" 
                stroke="rgba(139, 92, 246, 0.3)" 
                strokeWidth="1"
                style={{
                  animation: status === 'processing' ? 'glow 3s ease-in-out infinite 1s' : 'none'
                }}
              />
            </svg>
          </div>
        </div>

        {/* Log Console */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Live Console
          </div>
          
          <div 
            ref={logContainerRef}
            className="log-container"
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
              fontSize: '0.8rem',
              lineHeight: '1.5',
              overflowY: 'auto',
              overflowX: 'hidden',
              border: '1px solid rgba(55, 65, 81, 0.3)',
              minHeight: '200px',
              maxHeight: '350px',
              scrollBehavior: 'smooth'
            }}
          >
            {logs.length === 0 && (
              <div style={{ color: '#6B7280', fontStyle: 'italic' }}>
                Waiting for logs...
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
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            color: '#EF4444'
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
            <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(status === 'error' || status === 'completed') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
              style={{ fontSize: '0.9rem' }}
            >
              {status === 'error' ? 'Try Again' : 'Create Another'}
            </button>
          </div>
        )}
      </div>

      {/* CSS Animation Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
          @keyframes glow {
            0%, 100% { stroke-opacity: 0.3; }
            50% { stroke-opacity: 0.8; }
          }
          
          /* Log container scrollbar styling */
          .log-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
          }
          
          .log-container::-webkit-scrollbar {
            width: 8px;
          }
          
          .log-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
          }
          
          .log-container::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.2);
          }
          
          .log-container::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.8);
          }
          
          .log-container::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}
      </style>
    </div>
  )
}

export default ProgressModal 