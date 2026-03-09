import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const userLinks = [
  { to: '/events', label: 'Događaji' },
  { to: '/theaters', label: 'Kazališta' },
  { to: '/reservations', label: 'Rezervacije' },
  { to: '/reviews', label: 'Recenzije' },
]

const adminLinks = [
  { to: '/admin/events', label: 'Upravljanje Događajima' },
  { to: '/admin/theaters', label: 'Upravljanje Kazalištima' },
  { to: '/admin/reservations', label: 'Sve Rezervacije' },
  { to: '/admin/reviews', label: 'Sve Recenzije' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? adminLinks : userLinks

  // Close menu on route change — track previous pathname
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    if (isOpen) setIsOpen(false)
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        {/* Logo */}
        <Link to={isAdmin ? '/admin/events' : '/events'} className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-gold/30 bg-gold/10 transition-colors group-hover:border-gold/60 group-hover:bg-gold/20">
            <span className="font-display text-lg font-bold text-gold">T</span>
          </div>
          <span className="font-display text-xl font-semibold tracking-wide text-text-primary">
            Theatrum
          </span>
          {isAdmin && (
            <span className="ml-1 rounded-sm bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop links */}
        {isAuthenticated && (
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-gold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-gold" />
                  )}
                </Link>
              )
            })}
            <div className="ml-3 h-5 w-px bg-border-strong" />
            <button
              onClick={logout}
              className="ml-3 rounded-sm border border-border-strong px-4 py-1.5 text-sm font-medium text-text-secondary transition-all hover:border-gold/40 hover:text-gold"
            >
              Odjava
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isAuthenticated && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`h-px w-6 bg-text-primary transition-all duration-300 ${
                isOpen ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-px w-6 bg-text-primary transition-all duration-300 ${
                isOpen ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-overlay transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-40 flex h-full w-72 flex-col border-l border-border bg-base-light transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-display text-sm font-semibold tracking-widest uppercase text-gold/60">
            Izbornik
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {links.map((link, i) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-sm px-4 py-3 text-[15px] font-medium transition-all ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="border-t border-border p-4">
          {user && (
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-text-primary">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="w-full rounded-sm border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-gold/40 hover:text-gold"
          >
            Odjava
          </button>
        </div>
      </div>
    </nav>
  )
}
