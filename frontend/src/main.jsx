import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './Contexts/ThemeContext'
import { AuthProvider } from './Contexts/AuthContext'
import { ModalProvider } from './Contexts/ModalContext'
import { DataProvider } from './Contexts/DataContext'
import { NotificationProvider } from './Contexts/NotificationContext'
import { registerServiceWorker } from './utils/registerSW'

// Enregistrer le Service Worker pour PWA
registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <DataProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </DataProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
