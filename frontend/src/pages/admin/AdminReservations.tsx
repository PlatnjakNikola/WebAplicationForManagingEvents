import { useState } from 'react'
import { mockReservations } from '../../lib/mockData'
import toast from 'react-hot-toast'
import type { Reservation } from '../../types'

type FilterStatus = 'all' | 'confirmed' | 'cancelled'

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filtered = reservations
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const counts = {
    all: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  }

  function handleCancel(id: string) {
    if (!window.confirm('Otkazati ovu rezervaciju?')) return
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r))
    )
    toast.success('Rezervacija je otkazana.')
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Sve' },
    { key: 'confirmed', label: 'Potvrđene' },
    { key: 'cancelled', label: 'Otkazane' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Sve rezervacije</h1>
          <p className="mt-1 text-sm text-text-muted">{reservations.length} rezervacija</p>
        </div>
      </div>

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

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pl-3 pr-4">Događaj</th>
              <th className="py-3 pr-4">Kazalište</th>
              <th className="py-3 pr-4">Datum</th>
              <th className="py-3 pr-4">Karata</th>
              <th className="py-3 pr-4">Cijena</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-3 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-surface">
                <td className="py-3 pl-3 pr-4 font-medium text-text-primary">{r.eventTitle}</td>
                <td className="py-3 pr-4 text-text-secondary">{r.theaterName}</td>
                <td className="py-3 pr-4 text-text-secondary">{r.date} · {r.time}</td>
                <td className="py-3 pr-4 text-text-secondary">{r.numberOfTickets}</td>
                <td className="py-3 pr-4 text-gold">{r.totalPrice} €</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                      r.status === 'confirmed'
                        ? 'bg-accent-green/15 text-accent-green'
                        : 'bg-accent-red/15 text-accent-red'
                    }`}
                  >
                    {r.status === 'confirmed' ? 'Potvrđena' : 'Otkazana'}
                  </span>
                </td>
                <td className="py-3 pr-3 text-right">
                  {r.status === 'confirmed' ? (
                    <button onClick={() => handleCancel(r.id)} className="text-accent-red hover:underline">
                      Otkaži
                    </button>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-sm border border-border bg-surface p-10 text-center">
            <p className="text-sm text-text-muted">Nema rezervacija u ovoj kategoriji.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="rounded-sm border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-text-primary">{r.eventTitle}</h3>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {r.theaterName} · {r.date} u {r.time}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${
                    r.status === 'confirmed'
                      ? 'bg-accent-green/15 text-accent-green'
                      : 'bg-accent-red/15 text-accent-red'
                  }`}
                >
                  {r.status === 'confirmed' ? 'Potvrđena' : 'Otkazana'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                <span>{r.numberOfTickets} karata</span>
                <span className="font-medium text-gold">{r.totalPrice} €</span>
              </div>
              {r.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(r.id)}
                  className="mt-3 text-xs font-medium text-accent-red hover:underline"
                >
                  Otkaži rezervaciju
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
