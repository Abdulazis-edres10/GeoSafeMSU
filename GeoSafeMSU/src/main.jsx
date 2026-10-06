import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './context/AuthContext.jsx'
import { lightTheme } from './theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={lightTheme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
)
