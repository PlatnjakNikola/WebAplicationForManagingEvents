import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/axios'
import type { Review } from '../../types'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-gold' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default function AdminReviews() {
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterEvent, setFilterEvent] = useState('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc'>('date-desc')

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data } = await api.get('/reviews/admin')
        setAllReviews(data)
      } catch {
        // handled by axios interceptor
      }
    }
    fetchReviews()
  }, [])

  const eventOptions = useMemo(() => {
    const titles = [...new Set(allReviews.map((r) => r.eventTitle))]
    return titles.sort((a, b) => a.localeCompare(b, 'hr'))
  }, [allReviews])

  const reviews = useMemo(() => {
    let filtered = [...allReviews]
    if (filterEvent) filtered = filtered.filter((r) => r.eventTitle === filterEvent)
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating-desc': return b.rating - a.rating
        case 'rating-asc': return a.rating - b.rating
      }
    })
  }, [allReviews, filterEvent, sortBy])

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Sve recenzije</h1>
          <p className="mt-1 text-sm text-text-muted">{reviews.length} recenzija</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterEvent}
            onChange={(e) => { setFilterEvent(e.target.value); setExpandedId(null) }}
            className="h-[42px] rounded-sm border border-border bg-base-light px-3 text-sm text-text-primary outline-none focus:border-gold"
          >
            <option value="">Sve predstave</option>
            {eventOptions.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setExpandedId(null) }}
            className="h-[42px] rounded-sm border border-border bg-base-light px-3 text-sm text-text-primary outline-none focus:border-gold"
          >
            <option value="date-desc">Datum ↓</option>
            <option value="date-asc">Datum ↑</option>
            <option value="rating-desc">Ocjena ↓</option>
            <option value="rating-asc">Ocjena ↑</option>
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pl-3 pr-4">Korisnik</th>
              <th className="py-3 pr-4">Događaj</th>
              <th className="py-3 pr-4">Kazalište</th>
              <th className="py-3 pr-4">Ocjena</th>
              <th className="py-3 pr-4">Komentar</th>
              <th className="py-3 pr-3">Datum</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <>
                <tr
                  key={r.id}
                  onClick={() => toggleExpand(r.id)}
                  className={`cursor-pointer border-b transition-colors hover:bg-surface ${expandedId === r.id ? 'border-border bg-surface' : 'border-border/50'}`}
                >
                  <td className="py-3 pl-3 pr-4 font-medium text-text-primary">{r.userName}</td>
                  <td className="py-3 pr-4 text-text-secondary">{r.eventTitle}</td>
                  <td className="py-3 pr-4 text-text-secondary">{r.theaterName}</td>
                  <td className="py-3 pr-4">
                    <Stars rating={r.rating} />
                  </td>
                  <td className="max-w-xs truncate py-3 pr-4 text-text-secondary">
                    {r.comment || '—'}
                  </td>
                  <td className="py-3 pr-3 text-text-muted">
                    {new Date(r.createdAt).toLocaleDateString('hr-HR')}
                  </td>
                </tr>
                {expandedId === r.id && (
                  <tr key={`${r.id}-detail`} className="border-b border-border/50">
                    <td colSpan={6} className="bg-base-light px-6 py-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-text-muted">Korisnik</p>
                          <p className="mt-1 text-sm text-text-primary">{r.userName}</p>
                          <p className="text-xs text-text-muted">{r.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-text-muted">Događaj</p>
                          <p className="mt-1 text-sm text-text-primary">{r.eventTitle}</p>
                          <p className="text-xs text-text-muted">{r.theaterName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-text-muted">Detalji</p>
                          <p className="mt-1 text-sm text-text-primary">
                            Ocjena: {r.rating}/5 · {new Date(r.createdAt).toLocaleString('hr-HR')}
                          </p>
                        </div>
                      </div>
                      {r.comment && (
                        <div className="mt-3">
                          <p className="text-xs font-medium uppercase text-text-muted">Komentar</p>
                          <p className="mt-1 text-sm text-text-secondary">{r.comment}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {reviews.map((r) => (
          <div
            key={r.id}
            onClick={() => toggleExpand(r.id)}
            className={`cursor-pointer rounded-sm border bg-surface p-4 transition-colors ${expandedId === r.id ? 'border-gold/30' : 'border-border'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-text-primary">{r.eventTitle}</h3>
                <p className="mt-0.5 text-xs text-text-muted">{r.theaterName}</p>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {r.userName} · {new Date(r.createdAt).toLocaleDateString('hr-HR')}
            </p>
            {expandedId === r.id ? (
              <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                <p className="text-xs text-text-muted">{r.userEmail}</p>
                <p className="text-xs text-text-muted">
                  Datum: {new Date(r.createdAt).toLocaleString('hr-HR')}
                </p>
                {r.comment && (
                  <p className="text-sm text-text-secondary">{r.comment}</p>
                )}
              </div>
            ) : (
              r.comment && (
                <p className="mt-2 truncate text-sm text-text-secondary">{r.comment}</p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
