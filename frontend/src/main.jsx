import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './App.css'

import { SocketProvider } from './context/SocketContext'
import { LogoProvider } from './context/LogoContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // 3 minutes — data is considered fresh, no refetch during this period
      staleTime: 3 * 60 * 1000,
      // 15 minutes — keep in memory cache (survives tab switching)
      gcTime: 15 * 60 * 1000,
      // KEY mobile fix: don't refetch when user switches apps/tabs and comes back
      // Without this, every time a mobile user switches to another app and returns,
      // ALL queries fire again — causing loading spinners on every app switch
      refetchOnWindowFocus: false,
      // Refetch on reconnect (good for mobile — user might go offline and come back)
      refetchOnReconnect: true,
      // Only fetch when truly online — don't queue requests while offline
      networkMode: 'online',
    },
    mutations: {
      // Don't retry mutations on network error — let the user retry manually
      retry: 0,
      networkMode: 'online',
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SocketProvider>
            <LogoProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    boxShadow: 'var(--shadow-lg)',
                  },
                }}
              />
            </LogoProvider>
          </SocketProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)