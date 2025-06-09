import React, { useState } from 'react'
import './index.css'
import { useApiKey } from './contexts/ApiKeyContext'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ProgressModal from './components/ProgressModal'
import VideoPlayer from './components/VideoPlayer'

function App() {
  const [runId, setRunId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'landing' | 'preparing' | 'processing' | 'result'>('landing')
  const [selectedEngine, setSelectedEngine] = useState<'p5' | 'manim'>('p5')
  const { apiKey } = useApiKey()

  const handleSubmit = async (prompt: string, engine: 'p5' | 'manim', duration: number) => {
    setRunId(null)
    setVideoUrl(null)
    setSelectedEngine(engine) // Store the selected engine
    setCurrentView('preparing') // Show immediate feedback
    
    if (!apiKey) {
      alert('Please enter your API key')
      setCurrentView('landing')
      return
    }
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, engine, apiKey, duration }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setRunId(data.runId)
      setCurrentView('processing') // Switch to processing when runId is ready
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
      setCurrentView('landing')
    }
  }

  const handleVideoComplete = (url: string) => {
    setVideoUrl(url)
    setCurrentView('result')
  }

  const handleStartOver = () => {
    setRunId(null)
    setVideoUrl(null)
    setSelectedEngine('p5') // Reset to default
    setCurrentView('landing')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Header selectedEngine={selectedEngine} />
      
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
                      color: index === 0 ? '#007AFF' : '#6B7280',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Engine-specific hint */}
              <div style={{
                background: 'rgba(0, 122, 255, 0.1)',
                border: '1px solid rgba(0, 122, 255, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
                fontSize: '0.9rem',
                color: '#93C5FD',
                lineHeight: '1.5'
              }}>
                <strong>{selectedEngine === 'manim' ? 'Manim' : 'P5.js'}</strong> environment is being prepared. 
                {selectedEngine === 'manim' 
                  ? ' Mathematical rendering pipeline loading...' 
                  : ' Creative coding workspace initializing...'
                }
              </div>
            </div>
          </div>
        )}

        {currentView === 'processing' && runId && (
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <ProgressModal 
              runId={runId} 
              onDone={handleVideoComplete}
              engine={selectedEngine}
            />
          </div>
        )}

        {currentView === 'result' && videoUrl && (
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
      <VideoPlayer videoUrl={videoUrl} />
            <button
              onClick={handleStartOver}
              className="btn-secondary"
              style={{
                marginTop: '2rem',
                fontSize: '1.1rem'
              }}
            >
              Create Another Video
            </button>
          </div>
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
