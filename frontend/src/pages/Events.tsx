import { useState, useMemo, useEffect, useCallback } from 'react'
import EventCard from '../components/EventCard'
import EventDetailModal from '../components/EventDetailModal'
import ReservationModal from '../components/ReservationModal'
import { SkeletonCard } from '../components/Skeleton'
import { mockEvents, mockTheaters } from '../lib/mockData'
import type { Event } from '../types'

const ITEMS_PER_PAGE = 6

export default function Events() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>(mockEvents)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])

  // Filters
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [theaterFilter, setTheaterFilter] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Pagination
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())

      const matchesDate = !dateFilter || event.date === dateFilter

      const matchesTheater = !theaterFilter || event.theaterId === theaterFilter

      return matchesSearch && matchesDate && matchesTheater
    })
  }, [events, search, dateFilter, theaterFilter])

  const visibleEvents = filteredEvents.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEvents.length

  const clearFilters = () => {
    setSearch('')
    setDateFilter('')
    setTheaterFilter('')
  }

  const hasActiveFilters = search || dateFilter || theaterFilter

  const [reserveEvent, setReserveEvent] = useState<Event | null>(null)
  const [detailEvent, setDetailEvent] = useState<Event | null>(null)

  const handleReserve = (event: Event) => {
    setReserveEvent(event)
  }

  const handleReservationConfirm = useCallback((eventId: string, ticketCount: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, availableSeats: Math.max(0, e.availableSeats - ticketCount) } : e
      )
    )
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Događaji</h1>
          <p className="mt-1 text-sm text-text-muted">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'događaj' : 'događaja'}
          </p>
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 rounded-sm border border-border-strong px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-gold/40 hover:text-gold md:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filtriraj
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-base">
              !
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter panel */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 space-y-5 rounded-sm border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Filteri</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold hover:text-gold-light transition-colors"
                >
                  Očisti sve
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Pretraži</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Naziv predstave..."
                className="w-full rounded-sm border border-border-strong bg-base-light px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-gold/50"
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Datum</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-sm border border-border-strong bg-base-light px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-gold/50 [color-scheme:dark]"
              />
            </div>

            {/* Theater */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Kazalište</label>
              <select
                value={theaterFilter}
                onChange={(e) => setTheaterFilter(e.target.value)}
                className="w-full rounded-sm border border-border-strong bg-base-light px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-gold/50"
              >
                <option value="">Sva kazališta</option>
                {mockTheaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Event grid */}
        <div className="flex-1">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="mb-4 h-16 w-16 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-lg font-medium text-text-secondary">Nema rezultata</p>
              <p className="mt-1 text-sm text-text-muted">
                Nema događaja koji odgovaraju vašem filteru. Pokušajte promijeniti kriterije.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-sm border border-gold/30 px-4 py-2 text-sm font-medium text-gold transition-all hover:bg-gold/10"
                >
                  Očisti filtere
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : visibleEvents.map((event, i) => (
                      <div key={event.id} className="animate-stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <EventCard event={event} onReserve={handleReserve} onDetail={setDetailEvent} />
                      </div>
                    ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                    className="rounded-sm border border-border-strong px-8 py-3 text-sm font-medium text-text-secondary transition-all hover:border-gold/40 hover:text-gold"
                  >
                    Učitaj više ({filteredEvents.length - visibleCount} preostalo)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet filters */}
      <div
        className={`fixed inset-0 z-50 bg-overlay transition-opacity duration-300 md:hidden ${
          showMobileFilters ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setShowMobileFilters(false)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-base-light transition-transform duration-300 ease-out md:hidden ${
          showMobileFilters ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-text-muted/30" />
        </div>

        <div className="px-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text-primary">Filtriraj događaje</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gold hover:text-gold-light transition-colors"
              >
                Očisti
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">Pretraži</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Naziv predstave..."
                className="w-full rounded-sm border border-border-strong bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-gold/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">Datum</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-sm border border-border-strong bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-gold/50 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">Kazalište</label>
              <select
                value={theaterFilter}
                onChange={(e) => setTheaterFilter(e.target.value)}
                className="w-full rounded-sm border border-border-strong bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-gold/50"
              >
                <option value="">Sva kazališta</option>
                {mockTheaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 rounded-sm border border-border-strong px-4 py-3 text-sm font-medium text-text-secondary transition-all hover:border-gold/40"
            >
              Otkaži
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 rounded-sm bg-gold px-4 py-3 text-sm font-semibold text-base transition-all hover:bg-gold-light"
            >
              Gotovo ({filteredEvents.length})
            </button>
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} onReserve={(e) => { setDetailEvent(null); handleReserve(e) }} />

      {/* Reservation modal */}
      <ReservationModal event={reserveEvent} onClose={() => setReserveEvent(null)} onConfirm={handleReservationConfirm} />
    </div>
  )
}
