import React, { useState, useRef, useEffect } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'

interface LandingPageProps {
  onSubmit: (prompt: string, engine: 'p5' | 'manim', duration: number) => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('')
  const [engine, setEngine] = useState<'p5' | 'manim'>('p5')
  const [duration, setDuration] = useState(10)
  const { apiKey } = useApiKey()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [prompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    if (!apiKey) {
      alert('Please enter your API key first')
      return
    }
    onSubmit(prompt, engine, duration)
  }

  const isReady = prompt.trim() && apiKey

  return (
    <div style={{ 
      height: 'calc(100vh - 4rem)', // Subtract header height
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle floating background elements */}
      <div className="float" style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      
      <div className="float" style={{
        position: 'absolute',
        bottom: '15%',
        right: '5%',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0,
        animationDelay: '3s'
      }} />

      {/* Main content container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Compact Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '400', 
            color: 'white', 
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Create Videos from{' '}
            <span className="text-gradient" style={{ fontWeight: '600' }}>
              Your Imagination
            </span>
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#9CA3AF', 
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.4'
          }}>
            Transform ideas into dynamic visualizations with AI
          </p>
        </div>

        {/* Prompt Form */}
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem' 
        }}>
          {/* Main prompt input */}
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create..."
              className="input-futuristic"
              style={{
                width: '100%',
                minHeight: '100px',
                maxHeight: '150px',
                resize: 'none',
                fontSize: '1.05rem',
                lineHeight: '1.5',
                paddingBottom: '2rem'
              }}
              rows={3}
            />
            
            {/* Character count */}
            <div style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '1rem',
              fontSize: '0.7rem',
              color: '#6B7280'
            }}>
              {prompt.length}/1000
            </div>
          </div>

          {/* Inline options - Engine and Duration */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(26, 26, 26, 0.5)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(55, 65, 81, 0.3)'
          }}>
            {/* Engine selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '500',
                color: '#9CA3AF',
                marginBottom: '0.5rem'
              }}>
                Rendering Engine
              </label>
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setEngine('p5')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${engine === 'p5' ? '#3B82F6' : '#374151'}`,
                    background: engine === 'p5' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: engine === 'p5' ? '#60A5FA' : '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  p5.js
                </button>
                <button
                  type="button"
                  onClick={() => setEngine('manim')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${engine === 'manim' ? '#3B82F6' : '#374151'}`,
                    background: engine === 'manim' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: engine === 'manim' ? '#60A5FA' : '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Manim
                </button>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '500',
                color: '#9CA3AF',
                marginBottom: '0.5rem'
              }}>
                Duration: {duration}s
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  background: '#374151',
                  borderRadius: '2px',
                  appearance: 'none',
                  cursor: 'pointer',
                  marginTop: '0.75rem'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: '#6B7280',
                marginTop: '0.25rem'
              }}>
                <span>5s</span>
                <span>30s</span>
              </div>
            </div>
          </div>

          {/* Generate button and API key reminder in one row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            {/* API Key status */}
            <div style={{ 
              fontSize: '0.8rem', 
              color: apiKey ? '#10B981' : '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                background: apiKey ? '#10B981' : '#6B7280'
              }} />
              {apiKey ? 'Gemini API configured' : 'Add Gemini API key in settings ⚙️'}
            </div>

            {/* Generate button */}
            <button
              type="submit"
              disabled={!isReady}
              className={isReady ? 'btn-primary' : ''}
              style={{
                fontSize: '1rem',
                padding: '0.75rem 2rem',
                ...(isReady ? {} : {
                  background: '#374151',
                  color: '#6B7280',
                  cursor: 'not-allowed',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontWeight: '600'
                })
              }}
            >
              Generate Video
            </button>
          </div>
        </form>

        {/* Feature hints */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-powered
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            5-30s videos
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            MP4 export
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 