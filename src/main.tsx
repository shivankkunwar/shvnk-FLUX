import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import { HealthProvider } from './contexts/HealthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiKeyProvider>
      <HealthProvider>
    <App />
      </HealthProvider>
    </ApiKeyProvider>
  </StrictMode>,
)
