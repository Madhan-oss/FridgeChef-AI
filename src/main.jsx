import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid #F0EAE4',
          background: '#fff',
          color: '#1A1008',
        },
        success: {
          iconTheme: { primary: '#2D9C6B', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#FF6B35', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>,
)
