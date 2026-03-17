import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import type { Reservation } from '../types'

type FilterStatus = 'all' | 'confirmed' | 'cancelled'

export default function Reservations() {
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReservations() {
      try {
        const { data } = await api.get('/reservations')
        setReservations(data)
      } catch {
        // handled by axios interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  const filtered = reservations
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const counts = {
    all: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  }

  async function handleCancel(id: string) {
    if (!window.confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return
    try {
      await api.patch(`/reservations/${id}/cancel`)
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
      )
      setExpandedId(null)
      toast.success('Rezervacija je otkazana.')
    } catch {
      toast.error('Greška pri otkazivanju rezervacije.')
    }
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Sve' },
    { key: 'confirmed', label: 'Potvrđene' },
    { key: 'cancelled', label: 'Otkazane' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      {/* Header */}
      <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">
        Moje rezervacije
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Ukupno {reservations.length}{' '}
        {reservations.length === 1 ? 'rezervacija' : 'rezervacija'}
      </p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-gold text-base'
                : 'border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* Reservation list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-sm border border-border bg-surface p-5">
              <div className="h-5 w-2/3 rounded-sm bg-base-lighter" />
              <div className="mt-2 h-4 w-1/2 rounded-sm bg-base-lighter" />
            </div>
          ))
        ) : filtered.length === 0 ? (
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
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
              />
            </svg>
            <p className="mt-3 text-sm text-text-muted">
              Nema rezervacija u ovoj kategoriji.
            </p>
          </div>
        ) : (
          filtered.map((reservation, i) => (
            <div
              key={reservation.id}
              className="animate-stagger-in overflow-hidden rounded-sm border border-border bg-surface transition-colors hover:border-border-strong"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Accordion header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === reservation.id ? null : reservation.id)
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate font-display text-base font-semibold text-text-primary">
                      {reservation.eventTitle}
                    </h3>
                    <span
                      className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${
                        reservation.status === 'confirmed'
                          ? 'bg-accent-green/15 text-accent-green'
                          : 'bg-accent-red/15 text-accent-red'
                      }`}
                    >
                      {reservation.status === 'confirmed' ? 'Potvrđena' : 'Otkazana'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-text-muted">
                    {reservation.theaterName} · {reservation.date} u {reservation.time}
                  </p>
                </div>

                <div className="ml-4 flex items-center gap-4">
                  <span className="hidden text-sm font-medium text-gold sm:block">
                    {reservation.totalPrice} €
                  </span>
                  <svg
                    className={`h-5 w-5 text-text-muted transition-transform duration-200 ${
                      expandedId === reservation.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === reservation.id && (
                <div className="border-t border-border px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Detail label="Broj karata" value={`${reservation.numberOfTickets}`} />
                    <Detail label="Ukupna cijena" value={`${reservation.totalPrice} €`} />
                    <Detail label="Datum događaja" value={reservation.date} />
                    <Detail
                      label="Rezervirano"
                      value={new Date(reservation.createdAt).toLocaleDateString('hr-HR')}
                    />
                  </div>

                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="mt-4 rounded-sm border border-accent-red/30 px-4 py-2 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/10"
                    >
                      Otkaži rezervaciju
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-text-secondary">{value}</p>
    </div>
  )
}
