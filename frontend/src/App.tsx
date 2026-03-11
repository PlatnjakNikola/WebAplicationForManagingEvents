import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import Theaters from './pages/Theaters'
import TheaterDetail from './pages/TheaterDetail'
import Reservations from './pages/Reservations'
import Reviews from './pages/Reviews'
import AdminEvents from './pages/admin/AdminEvents'
import AdminTheaters from './pages/admin/AdminTheaters'
import AdminReservations from './pages/admin/AdminReservations'
import AdminReviews from './pages/admin/AdminReviews'
import { useAuthStore } from './store/authStore'

const router = createBrowserRouter([
  // Public routes (no navbar/footer)
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Protected routes with layout
  {
    path: '/',
    element: <Layout />,
    children: [
      // User routes
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Navigate to="/events" replace /> },
          { path: 'events', element: <Events /> },
          { path: 'theaters', element: <Theaters /> },
          { path: 'theaters/:id', element: <TheaterDetail /> },
          { path: 'reservations', element: <Reservations /> },
          { path: 'reviews', element: <Reviews /> },
        ],
      },
      // Admin routes
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { index: true, element: <Navigate to="/admin/events" replace /> },
          { path: 'events', element: <AdminEvents /> },
          { path: 'theaters', element: <AdminTheaters /> },
          { path: 'reservations', element: <AdminReservations /> },
          { path: 'reviews', element: <AdminReviews /> },
        ],
      },
    ],
  },

  // Catch all
  { path: '*', element: <Navigate to="/login" replace /> },
])

function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
            <span className="font-display text-3xl font-bold text-gold">T</span>
          </div>
          <svg className="h-6 w-6 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <>
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
      <RouterProvider router={router} />
    </>
  )
}

export default App
