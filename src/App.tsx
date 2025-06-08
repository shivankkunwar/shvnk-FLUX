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
  const [currentView, setCurrentView] = useState<'landing' | 'processing' | 'result'>('landing')
  const { apiKey } = useApiKey()

  const handleSubmit = async (prompt: string, engine: 'p5' | 'manim', duration: number) => {
    setRunId(null)
    setVideoUrl(null)
    setCurrentView('processing')
    
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
    setCurrentView('landing')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Header />
      
      {/* Main content with proper spacing for fixed header */}
      <main style={{ paddingTop: '4rem' }}>
        {currentView === 'landing' && (
          <LandingPage onSubmit={handleSubmit} />
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
    </div>
  )
}

export default App
