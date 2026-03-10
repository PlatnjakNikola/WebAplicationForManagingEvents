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

  useEffect(() => {
    hydrate()
  }, [hydrate])

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
