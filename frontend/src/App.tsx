import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

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
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
                <span className="text-gold">Theatrum</span>
              </h1>
              <p className="text-text-secondary text-lg font-body">
                Kazališni događaji na jednom mjestu
              </p>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
