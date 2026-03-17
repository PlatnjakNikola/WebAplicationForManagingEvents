import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import type { Review, Event } from '../types'

type Tab = 'mine' | 'all'

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              star <= (hover || rating)
                ? 'text-gold'
                : 'text-text-muted/30'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const [reviews, setReviews] = useState<Review[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewsRes, eventsRes] = await Promise.all([
          api.get('/reviews'),
          api.get('/events?limit=50'),
        ])
        setReviews(reviewsRes.data)
        setEvents(eventsRes.data.data)
      } catch {
        // handled by axios interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(0)
  const [formComment, setFormComment] = useState('')
  const [formEventId, setFormEventId] = useState('')

  const myReviews = reviews.filter((r) => r.userId === user?.id)
  const displayed = tab === 'mine' ? myReviews : reviews

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formEventId) return toast.error('Odaberite događaj.')
    if (formRating === 0) return toast.error('Odaberite ocjenu.')

    try {
      const { data: newReview } = await api.post('/reviews', {
        eventId: Number(formEventId),
        rating: formRating,
        comment: formComment || undefined,
      })
      setReviews((prev) => [newReview, ...prev])
      setShowForm(false)
      setFormRating(0)
      setFormComment('')
      setFormEventId('')
      toast.success('Recenzija je objavljena!')
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Greška pri objavi recenzije.'
      toast.error(message)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovu recenziju?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Recenzija je obrisana.')
    } catch {
      toast.error('Greška pri brisanju recenzije.')
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Sve recenzije' },
    { key: 'mine', label: 'Moje recenzije' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">
            Recenzije
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {reviews.length} {reviews.length === 1 ? 'recenzija' : 'recenzija'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-gold-light"
        >
          {showForm ? 'Zatvori formu' : 'Napiši recenziju'}
        </button>
      </div>

      {/* New review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-sm border border-border-strong bg-surface p-5"
        >
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Nova recenzija
          </h2>

          <div className="mt-4 space-y-4">
            {/* Event select */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Događaj
              </label>
              <select
                value={formEventId}
                onChange={(e) => setFormEventId(e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold"
              >
                <option value="">Odaberite događaj...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} — {ev.theaterName}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Ocjena
              </label>
              <div className="mt-1">
                <StarRating
                  rating={formRating}
                  interactive
                  onRate={setFormRating}
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Komentar (opcionalno)
              </label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold"
                placeholder="Podijelite svoje iskustvo..."
              />
            </div>

            <button
              type="submit"
              className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-base transition-colors hover:bg-gold-light"
            >
              Objavi recenziju
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-gold text-base'
                : 'border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {t.label}
            {t.key === 'mine' && ` (${myReviews.length})`}
          </button>
        ))}
      </div>

      {/* Reviews grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-sm border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 w-24 rounded-sm bg-base-lighter" />
                    <div className="mt-2 h-3 w-16 rounded-sm bg-base-lighter" />
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-5 w-5 rounded-sm bg-base-lighter" />
                    ))}
                  </div>
                </div>
                <div className="mt-3 h-10 rounded-sm bg-base-lighter" />
                <div className="mt-3 h-4 w-3/4 rounded-sm bg-base-lighter" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-sm border border-border bg-surface p-10 text-center">
            <svg
              className="mx-auto h-12 w-12 text-text-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <p className="mt-3 text-sm text-text-muted">
              {tab === 'mine'
                ? 'Još nemate recenzija. Napišite svoju prvu!'
                : 'Nema recenzija.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {displayed
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((review, i) => (
                <div
                  key={review.id}
                  className="animate-stagger-in rounded-sm border border-border bg-surface p-5 transition-colors hover:border-border-strong"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {review.userName}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Event info */}
                  <div className="mt-3 rounded-sm bg-base-light px-3 py-2">
                    <p className="text-sm font-medium text-gold">
                      {review.eventTitle}
                    </p>
                    <p className="text-xs text-text-muted">{review.theaterName}</p>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {review.comment}
                    </p>
                  )}

                  {/* Delete button for own reviews */}
                  {review.userId === user?.id && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="mt-3 text-xs font-medium text-accent-red/70 transition-colors hover:text-accent-red"
                    >
                      Obriši recenziju
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
