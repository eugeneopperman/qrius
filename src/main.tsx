import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n before app renders
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, you would send this to an error tracking service
        console.error('Root ErrorBoundary caught:', error, errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
