import React, { useState, useEffect } from 'react'
import './index.css'
import { useApiKey } from './contexts/ApiKeyContext'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ProgressModal from './components/ProgressModal'
import VideoPlayer from './components/VideoPlayer'
import UpdateNotification from './components/UpdateNotification'
import UpdateChecker from './components/UpdateChecker'

interface VideoResult {
  videoPath: string;
  downloadPath: string;
  filename: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'preparing' | 'processing' | 'result'>('landing')
  const [runId, setRunId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<'p5' | 'manim'>('p5')
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const { apiKey } = useApiKey()
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')

  // Effect to get app version
  useEffect(() => {
    if (window.electronAPI?.updater?.getAppVersion) {
      window.electronAPI.updater.getAppVersion()
        .then((version) => setAppVersion(version))
        .catch(() => setAppVersion('Unknown'));
    }
  }, [])

  // Effect to listen for render logs
  useEffect(() => {
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onRenderLog((_event, data) => {
        setLogs(prev => [...prev, data.message])
      })
      return cleanup
    }
  }, [])

  const handleSubmit = async (prompt: string, engine: 'p5' | 'manim', duration: number) => {
    // Reset state for new generation
    setRunId(null)
    setVideoUrl(null)
    setLogs([]) // Clear previous logs
    setSelectedEngine(engine)
    setCurrentView('preparing')
    
    if (!apiKey) {
      alert('Please enter your API key')
      setCurrentView('landing')
      return
    }
    
    if (!window.electronAPI) {
      alert('This app must be run as an Electron application')
      setCurrentView('landing')
      return
    }
    
    try {
      // Generate a run ID for tracking
      const newRunId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
      setRunId(newRunId)
      setCurrentView('processing')
      
      // Call Electron IPC instead of HTTP fetch
      const result = await window.electronAPI.generateVideo({
        prompt,
        engine,
        apiKey,
        duration
      });
      
      if (result.success && result.videoPath) {
        setVideoUrl(result.videoPath)
        setCurrentView('result')
        setVideoResult({
          videoPath: result.videoPath,
          downloadPath: result.downloadPath || '',
          filename: result.filename || 'video.mp4',
        });
      } else {
        throw new Error('Video generation failed')
      }
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
      setCurrentView('landing')
    }
  }

  const handleVideoComplete = (url: string) => {
    // If the ProgressModal indicates completion but we don't have a video URL yet,
    // we should have gotten it from the initial generateVideo call
    if (url === 'video-generated' && videoResult?.videoPath) {
      setVideoUrl(videoResult.videoPath)
    } else if (url !== 'video-generated') {
      setVideoUrl(url)
    }
    setCurrentView('result')
  }

  const handleStartOver = () => {
    setRunId(null)
    setVideoUrl(null)
    setLogs([]) // Clear logs when starting over
    setSelectedEngine('p5')
    setCurrentView('landing')
  }

  const handleUpdateCheck = () => {
    setShowUpdateNotification(true);
  }

  const handleUpdateNotificationClose = () => {
    setShowUpdateNotification(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Header selectedEngine={selectedEngine} />
      
      {/* Update Notification */}
      {showUpdateNotification && (
        <UpdateNotification onClose={handleUpdateNotificationClose} />
      )}
      
      {/* Manual Update Checker in Header */}
      <div style={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {appVersion && (
          <span style={{ 
            color: '#9CA3AF', 
            fontSize: '0.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem'
          }}>
            v{appVersion}
          </span>
        )}
        <UpdateChecker onUpdateCheck={handleUpdateCheck} />
      </div>
      
      {/* Main content with proper spacing for fixed header */}
      <main style={{ paddingTop: '4rem' }}>
        {currentView === 'landing' && (
          <LandingPage onSubmit={handleSubmit} />
        )}

        {currentView === 'preparing' && (
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.1) 0%, transparent 70%)'
          }}>
            <div style={{
              background: 'rgba(15, 15, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '2rem',
              padding: '3rem 4rem',
              textAlign: 'center',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {/* Animated Logo/Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 2rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Rotating outer ring */}
                <div style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #007AFF',
                  borderRight: '2px solid #007AFF',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite'
                }} />
                
                {/* Pulsing inner circle */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #007AFF 0%, #8B5CF6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s ease-in-out infinite',
                  boxShadow: '0 0 30px rgba(0, 122, 255, 0.3)'
                }}>
                  {selectedEngine === 'manim' ? (
                    <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )}
                </div>

                {/* Floating particles */}
                <div style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: '#007AFF',
                  borderRadius: '50%',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  animation: 'float 3s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: '#8B5CF6',
                  borderRadius: '50%',
                  bottom: '10px',
                  right: '10px',
                  animation: 'float 3s ease-in-out infinite 1s'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '5px',
                  height: '5px',
                  background: '#10B981',
                  borderRadius: '50%',
                  bottom: '15px',
                  left: '10px',
                  animation: 'float 3s ease-in-out infinite 2s'
                }} />
              </div>

              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0',
                background: 'linear-gradient(135deg, #007AFF 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Preparing Render Environment
              </h2>
              
              <p style={{
                color: '#9CA3AF',
                fontSize: '1.1rem',
                margin: '0 0 2rem 0',
                lineHeight: '1.6'
              }}>
                Setting up {selectedEngine === 'manim' ? 'mathematical animation' : 'creative coding'} workspace...
              </p>

              {/* Progressive status indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '2rem'
              }}>
                {['Initializing', 'Configuring', 'Ready'].map((status, index) => (
                  <div key={status} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 0.6,
                    animation: `fadeInLeft 0.5s ease-out ${index * 0.3}s both`
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === 0 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)',
                      animation: index === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none'
                    }} />
                    <span style={{
                      fontSize: '0.9rem',
                      color: index === 0 ? '#007AFF' : '#9CA3AF',
                      fontWeight: index === 0 ? '500' : '400'
                    }}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'processing' && runId && (
          <ProgressModal 
            runId={runId} 
            onDone={handleVideoComplete} 
            engine={selectedEngine}
            logs={logs} // Pass logs as props instead of ProgressModal fetching them
          />
        )}

        {currentView === 'result' && videoResult && (
          <VideoPlayer
            videoPath={videoResult.videoPath}
            downloadPath={videoResult.downloadPath}
            filename={videoResult.filename}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Enhanced CSS Animations for Preparing State */}
      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 0.8; 
            }
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(-50%); 
              opacity: 0.7; 
            }
            50% { 
              transform: translateY(-10px) translateX(-50%); 
              opacity: 1; 
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 0.6;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  )
}

export default App
