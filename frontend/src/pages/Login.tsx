import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.email('Unesite ispravnu email adresu').trim(),
  password: z.string().trim().min(6, 'Lozinka mora imati najmanje 6 znakova').regex(/^\S+$/, 'Lozinka ne smije sadržavati razmake'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const { isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Bug 6: Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/events' : '/events'} replace />
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    const result = await login(data.email, data.password)
    setIsLoading(false)

    if (result.success) {
      const user = useAuthStore.getState().user
      toast.success(`Dobrodošli, ${user?.firstName}!`)
      if (user?.role === 'admin') {
        navigate('/admin/events', { replace: true })
      } else {
        navigate('/events', { replace: true })
      }
    } else {
      setError('root', { message: result.error })
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — hero image (desktop only) */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden bg-base-light">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-base" />
        <div className="relative z-10 px-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
              <span className="font-display text-5xl font-bold text-gold">T</span>
            </div>
          </div>
          <h1 className="font-display text-5xl font-bold text-text-primary mb-4">
            Theatrum
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto">
            Otkrijte čaroliju kazališta. Pregledajte predstave, rezervirajte karte
            i podijelite svoja iskustva.
          </p>
          <div className="mt-12 flex justify-center gap-8 text-text-muted text-sm">
            <div>
              <p className="font-display text-2xl text-gold font-semibold">50+</p>
              <p>Predstava</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="font-display text-2xl text-gold font-semibold">12</p>
              <p>Kazališta</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="font-display text-2xl text-gold font-semibold">5k+</p>
              <p>Korisnika</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 text-center md:hidden">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
                <span className="font-display text-3xl font-bold text-gold">T</span>
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-text-primary">Theatrum</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-text-primary">Prijava</h2>
            <p className="mt-1 text-text-muted text-sm">Unesite svoje podatke za pristup</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && (
              <div className="rounded-sm border border-accent-red/30 bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vas@email.hr"
                className="w-full rounded-sm border border-border-strong bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/25"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-accent-red">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
                Lozinka
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Unesite lozinku"
                  className="w-full rounded-sm border border-border-strong bg-surface px-4 py-3 pr-11 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-accent-red">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-sm bg-gold px-4 py-3 text-sm font-semibold text-base transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Prijava...
                </span>
              ) : (
                'Prijavi se'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Nemate račun?{' '}
            <Link to="/register" className="font-medium text-gold hover:text-gold-light transition-colors">
              Registrirajte se
            </Link>
          </p>

          <div className="mt-6 rounded-sm border border-border bg-base-light p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Testni računi</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="text-text-muted">User:</span>
                <span className="text-right text-text-secondary">user@theatrum.hr / User1234</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-text-muted">Admin:</span>
                <span className="text-right text-text-secondary">admin@theatrum.hr / Admin1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
