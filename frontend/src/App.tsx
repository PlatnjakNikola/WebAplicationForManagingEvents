import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Events from './pages/Events'
import Theaters from './pages/Theaters'
import Reservations from './pages/Reservations'
import Reviews from './pages/Reviews'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'events', element: <Events /> },
      { path: 'theaters', element: <Theaters /> },
      { path: 'reservations', element: <Reservations /> },
      { path: 'reviews', element: <Reviews /> },
      { path: '*', element: <Navigate to="/events" replace /> },
    ],
  },
])

function App() {
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
