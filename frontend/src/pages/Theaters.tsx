import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SkeletonCard } from '../components/Skeleton'
import api from '../lib/axios'
import type { Theater } from '../types'

export default function Theaters() {
  const [loading, setLoading] = useState(true)
  const [theaters, setTheaters] = useState<Theater[]>([])

  useEffect(() => {
    async function fetchTheaters() {
      try {
        const { data } = await api.get('/theaters')
        setTheaters(data)
      } catch {
        // handled by axios interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchTheaters()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Kazališta</h1>
        <p className="mt-1 text-sm text-text-muted">
          {theaters.length} kazališta
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : theaters.map((theater, i) => (
          <div key={theater.id} className="animate-stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
          <Link
            to={`/theaters/${theater.id}`}
            className="group flex flex-col rounded-sm border border-border bg-surface p-6 transition-all hover:border-border-strong hover:shadow-lg hover:shadow-gold/5"
          >
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-gold/20 bg-gold/5 transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
              <svg className="h-6 w-6 text-gold/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
              </svg>
            </div>

            <h2 className="font-display text-xl font-semibold text-text-primary group-hover:text-gold transition-colors">
              {theater.name}
            </h2>

            <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">
              {theater.description}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <svg className="h-4 w-4 shrink-0 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="truncate">{theater.address}</span>
              </div>

              <div className="flex items-center gap-2 text-text-secondary">
                <svg className="h-4 w-4 shrink-0 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span>Kapacitet: {theater.capacity} mjesta</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="mt-auto pt-5 flex items-center gap-1 text-sm font-medium text-gold/60 group-hover:text-gold transition-colors">
              <span>Saznaj više</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
