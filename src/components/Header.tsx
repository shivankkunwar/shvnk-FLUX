import React, { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'
import SimpleHealthStatus from './SimpleHealthStatus'

interface HeaderProps {
  selectedEngine: 'p5' | 'manim'
}

const Header: React.FC<HeaderProps> = ({ selectedEngine }) => {
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white'
          }}
          className="text-xl font-semibold text-white logo-glow">
            RenderFlux
          </div>

          {/* Health Status and Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3"> {/* Adjusted space-x */}
            <SimpleHealthStatus selectedEngine={selectedEngine} />
            
            <button
              onClick={handleOpenModal}
              className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              title="API Key Settings"
              aria-label="API Key Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div
                className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${apiKey ? 'bg-green-400' : 'bg-red-500'}`}
                title={apiKey ? 'API Key set' : 'API Key not set'}
              />
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apiKeyModalTitle"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowApiKeyModal(false)}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div className="relative rounded-2xl p-6 sm:p-8 w-full max-w-md bg-gradient-gray-800-900 shadow-modal-custom">
            <div className="mb-6 text-center sm:text-left">
              <h2 id="apiKeyModalTitle" className="text-xl sm:text-2xl font-semibold text-white mb-1.5">
                API Configuration
              </h2>
              <p className="text-gray-400 text-sm">
                Enter your Google Gemini API key to enable video generation.
              </p>
            </div>

            <div>
              <div className="mb-5">
                <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-200 mb-2">
                  Google Gemini API Key
                </label>
                <input
                  id="gemini-api-key"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="input-futuristic w-full font-mono text-sm focus:ring-offset-gray-800" // Added focus:ring-offset-gray-800
                />
                <p className="text-xs text-gray-500 mt-2.5">
                  Your API key is stored securely in your local application settings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
                <button
                  onClick={handleSaveApiKey}
                  type="button"
                  className="btn-primary flex-1 text-sm py-2.5 px-4 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Save Key
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
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