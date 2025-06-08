import React, { useEffect, useState, useRef } from 'react'

interface ProgressModalProps {
  runId: string
  onDone: (videoPath: string) => void
  engine?: 'p5' | 'manim'
}

interface EducationalCard {
  id: string
  title: string
  description: string
  content: string
  icon: React.ReactNode
}

const ProgressModal: React.FC<ProgressModalProps> = ({ runId, onDone, engine = 'p5' }) => {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<'connecting' | 'processing' | 'completed' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [showEducational, setShowEducational] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [startTime] = useState(Date.now())
  const logContainerRef = useRef<HTMLDivElement>(null)

  // P5.js Educational Content
  const p5Cards: EducationalCard[] = [
    {
      id: 'canvas',
      title: 'Canvas Creation',
      description: 'How browser rendering works',
      content: 'Your code creates a virtual canvas where every pixel is calculated in real-time. The browser\'s rendering engine transforms mathematical functions into visual elements at 60fps.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      id: 'animation',
      title: 'Animation Loop Magic',
      description: 'The illusion of motion',
      content: 'Every frame is a snapshot frozen in time. By drawing 30 frames per second, we create smooth motion that tricks your brain into seeing continuous movement.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'capture',
      title: 'Frame Capture Process',
      description: 'Puppeteer screenshot mechanics',
      content: 'A headless browser runs your animation while our system captures each frame as a high-quality PNG image, building a sequence of thousands of individual screenshots.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'encoding',
      title: 'Video Assembly',
      description: 'FFmpeg encoding pipeline',
      content: 'Individual frames are compressed and encoded into a single MP4 file using advanced video codecs. This process optimizes file size while maintaining visual quality.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'optimization',
      title: 'Performance Optimization',
      description: 'Why frame rates matter',
      content: 'Higher frame rates create smoother motion but increase file size. 30fps provides the perfect balance between smooth animation and reasonable processing time.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]

  // Manim Educational Content
  const manimCards: EducationalCard[] = [
    {
      id: 'scene-graph',
      title: 'Mathematical Scene Graph',
      description: 'Object hierarchy visualization',
      content: 'Manim creates a tree of mathematical objects - from simple points to complex equations. Each object knows how to animate itself and interact with others in the scene.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'interpolation',
      title: 'Animation Interpolation',
      description: 'Easing functions & transformations',
      content: 'Smooth transitions between states use mathematical interpolation. Bezier curves and easing functions create natural-feeling animations that follow physics principles.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'latex',
      title: 'LaTeX Integration',
      description: 'Mathematical typesetting pipeline',
      content: 'Complex mathematical expressions are rendered using LaTeX, the gold standard for mathematical typesetting. Each symbol is precisely positioned and scaled.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'compilation',
      title: 'Python to Video',
      description: 'Scene compilation process',
      content: 'Your Python code is analyzed and broken down into discrete animation segments. Each segment is rendered independently, then assembled into the final video sequence.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      id: 'advanced',
      title: 'Advanced Animations',
      description: 'Morphing, highlighting, synchronized effects',
      content: 'Complex animations like object morphing and coordinated movements require precise timing calculations. Manim handles the mathematical complexity behind the scenes.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ]

  const cards = engine === 'manim' ? manimCards : p5Cards

  useEffect(() => {
    if (!runId) return

    const eventSource = new EventSource(`/api/logs?runId=${runId}`)
    
    eventSource.onopen = () => {
      setStatus('processing')
      // Start educational transition after 2 seconds
      setTimeout(() => {
        setShowEducational(true)
      }, 2000)
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

  // Auto-advance carousel
  useEffect(() => {
    if (!showEducational || status !== 'processing') return

    const interval = setInterval(() => {
      setCurrentCardIndex(prev => (prev + 1) % cards.length)
    }, 8000) // Change card every 8 seconds

    return () => clearInterval(interval)
  }, [showEducational, status, cards.length])

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
        }
      }, 10)
    }
  }, [logs])

  const getLogColor = (log: string) => {
    const logLower = log.toLowerCase()
    
    // Manim progress messages (now properly labeled)
    if (log.includes('[Manim Progress]') || 
        (log.includes('Animation') && (log.includes('%|') || log.includes('it/s')))) {
      return '#60A5FA' // Blue for progress
    }
    
    // Actual errors (properly labeled from backend)
    if (log.includes('[Manim Error]') || 
        logLower.includes('traceback') || 
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

  const getElapsedTime = () => {
    const elapsed = Date.now() - startTime
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
        width: '95%',
        maxWidth: showEducational ? '1200px' : '900px',
        height: '85%',
        maxHeight: '700px',
        background: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        display: 'flex',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Log Sidebar */}
        <div style={{
          width: showEducational ? '350px' : '100%',
          background: showEducational ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: showEducational ? '1.5rem' : '2rem',
          borderRight: showEducational ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
        }}>
          {/* Header */}
          <div style={{ 
            marginBottom: '1.5rem',
            opacity: showEducational ? 0.9 : 1,
            transition: 'opacity 0.5s ease'
          }}>
            <h2 style={{
              fontSize: showEducational ? '1.25rem' : '1.5rem',
              fontWeight: '600',
              color: 'white',
              margin: '0 0 0.75rem 0',
              transition: 'font-size 0.5s ease'
            }}>
              {showEducational ? 'Live Console' : 'Generating Video'}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: showEducational ? '0.85rem' : '0.9rem'
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
                {status === 'connecting' && 'Connecting...'}
                {status === 'processing' && `Processing • ${getElapsedTime()}`}
                {status === 'completed' && 'Completed'}
                {status === 'error' && 'Error occurred'}
              </span>
            </div>
          </div>

          {/* Log Console */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div 
              ref={logContainerRef}
              className="log-container"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '0.75rem',
                padding: showEducational ? '0.75rem' : '1rem',
                fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
                fontSize: showEducational ? '0.7rem' : '0.8rem',
                lineHeight: '1.4',
                overflowY: 'auto',
                overflowX: 'hidden',
                border: '1px solid rgba(55, 65, 81, 0.2)',
                scrollBehavior: 'smooth',
                transition: 'all 0.5s ease'
              }}
            >
              {logs.length === 0 && (
                <div style={{ color: '#6B7280', fontStyle: 'italic' }}>
                  Connecting to render process...
                </div>
              )}
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  style={{ 
                    color: getLogColor(log),
                    marginBottom: '0.25rem',
                    wordBreak: 'break-word',
                    fontSize: showEducational ? '0.7rem' : '0.8rem'
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
              borderRadius: '0.75rem',
              padding: '1rem',
              color: '#EF4444',
              marginTop: '1rem',
              fontSize: showEducational ? '0.8rem' : '0.9rem',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: '600',
                flexShrink: 0,
                width: '100%'
              }}>
                <svg style={{ width: '1rem', height: '1rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Error Details
                </span>
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                lineHeight: '1.4',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxSizing: 'border-box'
              }}>
                {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(status === 'error' || status === 'completed') && !showEducational && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
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

        {/* Educational Carousel */}
        {showEducational && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)'
          }}>
            {/* Carousel Header */}
            <div style={{
              marginBottom: '2rem',
              animation: 'slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 0.5rem 0',
                background: 'linear-gradient(135deg, #007AFF 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                How {engine === 'manim' ? 'Manim' : 'P5.js'} Rendering Works
              </h3>
              <p style={{
                color: '#9CA3AF',
                fontSize: '0.95rem',
                margin: 0
              }}>
                Learn the magic behind your video generation while we work
              </p>
            </div>

            {/* Vertical Carousel Container */}
            <div style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '1rem'
            }}>
              {/* Gradient Overlays */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(to bottom, rgba(15, 15, 15, 0.95) 0%, transparent 100%)',
                zIndex: 10,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(to top, rgba(15, 15, 15, 0.95) 0%, transparent 100%)',
                zIndex: 10,
                pointerEvents: 'none'
              }} />

              {/* Cards Container */}
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {cards.map((card, index) => {
                  const offset = index - currentCardIndex
                  const isActive = offset === 0
                  const isVisible = Math.abs(offset) <= 1

                  return (
                    <div
                      key={card.id}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        padding: '0 1rem',
                        transform: `translateY(${offset * 120}px) scale(${isActive ? 1 : 0.9})`,
                        opacity: isVisible ? (isActive ? 1 : 0.4) : 0,
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isActive ? 'none' : 'blur(1px)',
                        zIndex: isActive ? 2 : 1
                      }}
                    >
                      <div style={{
                        background: isActive ? 
                          'rgba(15, 15, 15, 0.95)' : 
                          'rgba(255, 255, 255, 0.04)',
                        borderRadius: '1.25rem',
                        padding: '2rem',
                        border: isActive ? 
                          '1px solid rgba(0, 122, 255, 0.4)' : 
                          '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? 
                          '0 20px 40px -12px rgba(0, 122, 255, 0.25)' : 
                          '0 10px 20px -8px rgba(0, 0, 0, 0.2)',
                        backdropFilter: isActive ? 'blur(20px)' : 'none'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1.5rem'
                        }}>
                          <div style={{
                            color: isActive ? '#007AFF' : '#6B7280',
                            transition: 'color 0.5s ease',
                            marginTop: '0.25rem'
                          }}>
                            {card.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '1.25rem',
                              fontWeight: '600',
                              color: 'white',
                              margin: '0 0 0.5rem 0'
                            }}>
                              {card.title}
                            </h4>
                            <p style={{
                              fontSize: '0.9rem',
                              color: '#007AFF',
                              margin: '0 0 1rem 0',
                              fontWeight: '500'
                            }}>
                              {card.description}
                            </p>
                            <p style={{
                              fontSize: '0.95rem',
                              color: '#D1D5DB',
                              lineHeight: '1.6',
                              margin: 0
                            }}>
                              {card.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Indicators */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '0.5rem',
                zIndex: 20
              }}>
                {cards.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === currentCardIndex ? '#007AFF' : 'rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons for Educational View */}
            {(status === 'error' || status === 'completed') && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2rem',
                animation: 'fadeIn 0.5s ease'
              }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 2rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  {status === 'error' ? 'Try Again' : 'Create Another Video'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced CSS Animations */}
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
          
          @keyframes slideInRight {
            from {
              transform: translateX(30px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          /* Enhanced Log container scrollbar styling */
          .log-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 122, 255, 0.5) transparent;
          }
          
          .log-container::-webkit-scrollbar {
            width: 6px;
          }
          
          .log-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }
          
          .log-container::-webkit-scrollbar-thumb {
            background: rgba(0, 122, 255, 0.5);
            border-radius: 3px;
            border: 1px solid rgba(0, 0, 0, 0.1);
          }
          
          .log-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 122, 255, 0.8);
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