import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Events from './pages/Events'
import Theaters from './pages/Theaters'
import Reservations from './pages/Reservations'
import Reviews from './pages/Reviews'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#141b2d',
            color: '#f1efe9',
            border: '1px solid rgba(201, 168, 76, 0.25)',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
          success: {
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#141b2d',
            },
          },
          error: {
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#141b2d',
            },
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          {/* User routes */}
          <Route path="/events" element={<Events />} />
          <Route path="/theaters" element={<Theaters />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reviews" element={<Reviews />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
