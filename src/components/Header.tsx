import React, { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'

const Header: React.FC = () => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const { apiKey, setApiKey } = useApiKey()

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey)
    setTempApiKey('')
    setShowApiKeyModal(false)
  }

  const handleOpenModal = () => {
    setTempApiKey(apiKey || '')
    setShowApiKeyModal(true)
  }

  return (
    <>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white'
          }}>
            RenderFlux
          </div>

          {/* Settings button */}
          <button
            onClick={handleOpenModal}
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#9CA3AF',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.background = 'rgba(26, 26, 26, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9CA3AF'
              e.currentTarget.style.background = 'transparent'
            }}
            title="Settings"
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            
            {/* Status indicator */}
            <div style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: apiKey ? '#10B981' : '#EF4444'
            }} />
          </button>
        </div>
      </header>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          {/* Backdrop */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowApiKeyModal(false)}
          />
          
          {/* Modal */}
          <div className="glass" style={{
            position: 'relative',
            borderRadius: '1rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '28rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                API Configuration
              </h2>
              <p style={{
                color: '#9CA3AF',
                fontSize: '0.875rem'
              }}>
                Enter your Google Gemini API key to enable video generation
              </p>
            </div>

            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#E5E7EB',
                  marginBottom: '0.5rem'
                }}>
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="input-futuristic"
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  marginTop: '0.5rem'
                }}>
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                paddingTop: '1rem'
              }}>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #4B5563',
                    color: '#9CA3AF',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6B7280'
                    e.currentTarget.style.color = '#E5E7EB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#4B5563'
                    e.currentTarget.style.color = '#9CA3AF'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header 