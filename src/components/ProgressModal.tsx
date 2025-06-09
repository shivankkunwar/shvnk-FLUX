import React, { useEffect, useState, useRef } from 'react'

interface ProgressModalProps {
  runId: string
  onDone: (videoPath: string) => void
  engine?: 'p5' | 'manim'
  logs: string[]
}

interface EducationalCard {
  id: string
  title: string
  description: string
  content: string
  icon: React.ReactNode
}

const ProgressModal: React.FC<ProgressModalProps> = ({ runId, onDone, engine = 'p5', logs }) => {
  const [status, setStatus] = useState<'connecting' | 'processing' | 'completed' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [showEducational, setShowEducational] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [startTime] = useState(Date.now())
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Educational cards for different engines
  const p5Cards: EducationalCard[] = [
    {
      id: '1',
      title: 'P5.js Creative Coding',
      description: 'The foundation of interactive art',
      content: 'P5.js is a JavaScript library that makes coding accessible for artists, designers, and educators. It provides a simple way to create visual art, animations, and interactive experiences in the browser.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a4 4 0 004 4h4v7z" /></svg>
    },
    {
      id: '2',
      title: 'Canvas Rendering',
      description: 'Drawing magic in the browser',
      content: 'P5.js uses HTML5 Canvas to render graphics. Each frame, the canvas is cleared and redrawn, creating smooth animations. The draw() function runs continuously, updating your visual elements 60 times per second.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      id: '3',
      title: 'Video Generation',
      description: 'From code to cinema',
      content: 'Your P5.js sketch is captured frame by frame using a headless browser. Each frame is saved as an image, then combined using FFmpeg to create a smooth video file. This process ensures high-quality output.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    }
  ]

  const manimCards: EducationalCard[] = [
    {
      id: '1',
      title: 'Mathematical Animation',
      description: 'Bringing math to life',
      content: 'Manim was created by Grant Sanderson (3Blue1Brown) to animate mathematical concepts. It excels at creating educational videos with smooth transitions, geometric transformations, and mathematical notation.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
    {
      id: '2',
      title: 'Scene-Based Architecture',
      description: 'Structured storytelling',
      content: 'Manim organizes animations into scenes. Each scene contains mathematical objects (Mobjects) that can be transformed, animated, and composed together. This structure makes complex animations manageable and reusable.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      id: '3',
      title: 'Professional Rendering',
      description: 'Cinema-quality output',
      content: 'Manim renders to high-quality video formats using Cairo graphics and FFmpeg. It supports 4K resolution, custom frame rates, and professional codecs. The rendering process optimizes each frame for maximum visual quality.',
      icon: <svg style={{ width: '2rem', height: '2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1h-2a1 1 0 01-1-1V6H7v16a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3z" /></svg>
    }
  ]

  // Select cards based on engine
  const cards = engine === 'manim' ? manimCards : p5Cards

  // Initialize processing and start educational transition
  useEffect(() => {
    if (!runId) return
    
    setStatus('processing')
    // Start educational transition after 2 seconds
    setTimeout(() => {
      setShowEducational(true)
    }, 2000)
  }, [runId])

  // Monitor logs for errors and completion - SAFER VERSION
  useEffect(() => {
    if (!logs || logs.length === 0) return

    try {
      const latestLog = logs[logs.length - 1]
      if (!latestLog) return
      
      console.log('[ProgressModal] Processing log:', latestLog)
      
      // Check for errors (but not progress messages or success contexts)
      const isProgress = latestLog.includes('Animation') && (latestLog.includes('%|') || latestLog.includes('it/s'))
      
      // Only detect ACTUAL errors, not words in successful contexts
      const isRealError = (
        // Actual error patterns
        (latestLog.toLowerCase().includes('error:') || latestLog.toLowerCase().includes('error ')) &&
        !latestLog.toLowerCase().includes('completed successfully')
      ) || (
        latestLog.toLowerCase().includes('failed') && 
        !latestLog.toLowerCase().includes('completed successfully') &&
        !latestLog.toLowerCase().includes('generation completed') &&
        !latestLog.toLowerCase().includes('video generation')
      ) || (
        latestLog.toLowerCase().includes('traceback') ||
        latestLog.toLowerCase().includes('exception:') ||
        latestLog.toLowerCase().includes('syntax error') ||
        latestLog.toLowerCase().includes('module not found') ||
        latestLog.toLowerCase().includes('command not found') ||
        latestLog.toLowerCase().includes('process exited with code') &&
        !latestLog.includes('code 0') // Exit code 0 is success
      )
      
      // Add debug logging for error detection
      if (isRealError) {
        console.log('[ProgressModal] DEBUG - Error patterns detected in log:', latestLog)
        console.log('[ProgressModal] DEBUG - isProgress:', isProgress)
        console.log('[ProgressModal] DEBUG - status:', status)
      }
      
      if (isRealError && !isProgress && status === 'processing') {
        console.log('[ProgressModal] Error detected:', latestLog)
        setError(latestLog)
        setStatus('error')
      }
      
      // Check for completion - ONLY look for actual video completion, not code generation
      const completionKeywords = [
        'video generation completed successfully',
        'video generation completed',
        'video saved successfully', 
        'video created successfully',
        'render complete',
        'video saved to',
        'ffmpeg encoding completed',
        'video file created',
        'video output saved'
      ]
      
      // DO NOT treat these as completion:
      const falseCompletionKeywords = [
        'code generation completed',
        'code generation finished',
        'generation complete'  // This is just code generation, not video
      ]
      
      const isCompleted = completionKeywords.some(keyword => 
        latestLog.toLowerCase().includes(keyword)
      ) && !falseCompletionKeywords.some(keyword => 
        latestLog.toLowerCase().includes(keyword)
      )
      
      if (isCompleted && status === 'processing') {
        console.log('[ProgressModal] Completion detected:', latestLog)
        setStatus('completed')
        
        // Delay the onDone call to prevent immediate unmounting
        setTimeout(() => {
          // Use latest status value to avoid stale closure
          if (typeof onDone === 'function') {
            onDone('video-generated')
          }
        }, 500)
      }
    } catch (err) {
      console.error('[ProgressModal] Error in log processing:', err)
      setError('Log processing error: ' + String(err))
      setStatus('error')
    }
  }, [logs, status, onDone])

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