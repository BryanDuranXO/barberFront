import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import LoginView from './App.jsx'
import DashboardView from './screens/DashboardView .jsx'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppointmentsView from './screens/AppointmentsView .jsx'
import QRGeneratedView from './screens/QRGeneratedView .jsx'
import ManageAppointmentsView from './screens/ManageAppointmentsView .jsx'
import EmployeesView from './screens/EmployeesView.jsx'
import { Scan } from 'lucide-react'
import ScanQRView from './screens/ScanQRView.jsx'
import QRScannedView from './screens/QRScannedView.jsx'
import StaticQRView from './screens/StaticQRView.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import ProfileView from './screens/ProfileView.jsx'


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registrado'))
      .catch(err => console.error('❌ SW error', err))
  })
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginView />} />

        {/* Rutas protegidas envueltas en AuthLayout (incluye Header) */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/appointments" element={<AppointmentsView />} />
          <Route path='/QRGenerated' element={<QRGeneratedView />} />
          <Route path='/manage-appointments' element={<ManageAppointmentsView />} />
          <Route path='/employees' element={<EmployeesView />} />
          <Route path='/scan-qr' element={<ScanQRView />} />
          <Route path='/qr-scanned' element={<QRScannedView />} />
          <Route path='/static-qr' element={<StaticQRView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </StrictMode>
)
