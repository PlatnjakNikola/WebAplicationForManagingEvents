import { useParams, Link } from 'react-router-dom'
import { mockTheaters, mockEvents } from '../lib/mockData'
import EventCard from '../components/EventCard'
import ReservationModal from '../components/ReservationModal'
import { useState } from 'react'
import type { Event } from '../types'

export default function TheaterDetail() {
  const { id } = useParams<{ id: string }>()
  const theater = mockTheaters.find((t) => t.id === id)
  const theaterEvents = mockEvents.filter((e) => e.theaterId === id)
  const [reserveEvent, setReserveEvent] = useState<Event | null>(null)

  if (!theater) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center md:px-8">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Kazalište nije pronađeno
        </h1>
        <Link
          to="/theaters"
          className="mt-4 inline-block text-sm font-medium text-gold hover:text-gold-light transition-colors"
        >
          ← Natrag na popis
        </Link>
      </div>
    )
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${theater.latitude},${theater.longitude}&zoom=15`

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link to="/theaters" className="transition-colors hover:text-gold border-b border-transparent hover:border-gold">
          ← Nazad
        </Link>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Details + Events */}
        <div className="flex-1">
          {/* Theater header */}
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">
            {theater.name}
          </h1>
          <p className="mt-3 text-text-secondary leading-relaxed">
            {theater.description}
          </p>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </>
              }
              label="Adresa"
              value={theater.address}
            />
            <InfoItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              }
              label="Kapacitet"
              value={`${theater.capacity} mjesta`}
            />
            <InfoItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              }
              label="Kontakt"
              value={theater.contact}
              href={`tel:${theater.contact.replace(/\s+/g, '')}`}
            />
            <InfoItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
              label="Radno vrijeme"
              value={theater.workingHours}
            />
          </div>

          {/* Mobile map */}
          <div className="mt-8 overflow-hidden rounded-sm border border-border lg:hidden">
            <iframe
              src={mapSrc}
              className="h-64 w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Lokacija: ${theater.name}`}
            />
          </div>

          {/* Events section */}
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Nadolazeći događaji
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {theaterEvents.length}{' '}
              {theaterEvents.length === 1 ? 'događaj' : 'događaja'}
            </p>

            {theaterEvents.length === 0 ? (
              <div className="mt-6 rounded-sm border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-muted">
                  Trenutno nema nadolazećih događaja u ovom kazalištu.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {theaterEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onReserve={setReserveEvent}
                    onDetail={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky map (desktop only) */}
        <div className="hidden lg:block lg:w-96">
          <div className="sticky top-24 overflow-hidden rounded-sm border border-border">
            <iframe
              src={mapSrc}
              className="h-[400px] w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Lokacija: ${theater.name}`}
            />
            <div className="border-t border-border bg-surface p-4">
              <p className="text-sm font-medium text-text-primary">
                {theater.name}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {theater.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal
        event={reserveEvent}
        onClose={() => setReserveEvent(null)}
      />
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-border bg-surface p-4">
      <svg
        className="h-5 w-5 shrink-0 text-gold/60 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        {icon}
      </svg>
      <div>
        <p className="text-xs font-medium text-text-muted">{label}</p>
        {href ? (
          <a href={href} className="mt-0.5 block text-sm text-gold hover:text-gold-light transition-colors">
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-text-secondary">{value}</p>
        )}
      </div>
    </div>
  )
}
