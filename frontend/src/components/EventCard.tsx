import type { Event } from '../types'

interface EventCardProps {
  event: Event
  onReserve: (event: Event) => void
  onDetail: (event: Event) => void
}

export default function EventCard({ event, onReserve, onDetail }: EventCardProps) {
  const isAlmostFull = event.availableSeats < 50
  const isSoldOut = event.availableSeats === 0

  const formattedDate = new Date(event.date).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      onClick={() => onDetail(event)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-sm border border-border bg-surface transition-all hover:border-border-strong hover:shadow-lg hover:shadow-gold/5"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />

        {/* Duration badge */}
        <span className="absolute top-3 right-3 rounded-sm bg-base/70 px-2 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
          {event.duration}
        </span>

        {/* Availability badge */}
        {isAlmostFull && !isSoldOut && (
          <span className="absolute top-3 left-3 rounded-sm bg-accent-red/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Još {event.availableSeats} mjesta
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 left-3 rounded-sm bg-text-muted/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Rasprodano
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-gold transition-colors">
          {event.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-text-muted leading-relaxed">
          {event.description}
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
            <svg className="h-4 w-4 shrink-0 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{formattedDate} u {event.time}h</span>
          </div>

          <div className="flex items-center gap-2 text-text-secondary">
            <svg className="h-4 w-4 shrink-0 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{event.theaterName}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 mt-5">
          <div>
            <span className="font-display text-xl font-bold text-gold">{event.pricePerTicket}€</span>
            <span className="ml-1 text-xs text-text-muted">/ karta</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onReserve(event) }}
            disabled={isSoldOut}
            className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-base transition-all hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSoldOut ? 'Rasprodano' : 'Rezerviraj'}
          </button>
        </div>
      </div>
    </div>
  )
}
