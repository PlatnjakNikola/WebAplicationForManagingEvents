import { useEffect, useState } from 'react'
import type { Event } from '../types'

interface EventDetailModalProps {
  event: Event | null
  onClose: () => void
  onReserve: (event: Event) => void
}

export default function EventDetailModal({ event, onClose, onReserve }: EventDetailModalProps) {
  const isOpen = !!event

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!event) return null

  const isAlmostFull = event.availableSeats > 0 && event.availableSeats < 50
  const isSoldOut = event.availableSeats === 0

  const formattedDate = new Date(event.date).toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[80] bg-overlay transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Desktop modal */}
      <div
        className={`fixed inset-0 z-[90] hidden items-center justify-center p-4 md:flex ${
          isOpen ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`w-full max-w-lg overflow-hidden rounded-sm border border-border bg-base-light shadow-2xl transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <DetailContent
            event={event}
            formattedDate={formattedDate}
            isAlmostFull={isAlmostFull}
            isSoldOut={isSoldOut}
            onClose={onClose}
            onReserve={onReserve}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[90] max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-base-light transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-text-muted/30" />
        </div>
        <DetailContent
          event={event}
          formattedDate={formattedDate}
          isAlmostFull={isAlmostFull}
          isSoldOut={isSoldOut}
          onClose={onClose}
          onReserve={onReserve}
        />
      </div>
    </>
  )
}

function DetailContent({
  event,
  formattedDate,
  isAlmostFull,
  isSoldOut,
  onClose,
  onReserve,
}: {
  event: Event
  formattedDate: string
  isAlmostFull: boolean
  isSoldOut: boolean
  onClose: () => void
  onReserve: (event: Event) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="px-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border py-5">
        <div className="pr-4">
          <h2 className="font-display text-xl font-bold text-text-primary">{event.title}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{event.theaterName}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="mt-5 overflow-hidden rounded-sm">
        {imgError ? (
          <div className="flex h-48 w-full flex-col items-center justify-center gap-2 bg-surface">
            <svg className="h-16 w-16 text-gold/15" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M10 14c0-2 2-4 4-4h10c2 0 4 2 4 4v12c0 6-4 10-9 10s-9-4-9-10V14z" fill="currentColor" fillOpacity={0.3} />
              <circle cx="17" cy="20" r="1.5" fill="currentColor" fillOpacity={0.6} />
              <circle cx="25" cy="20" r="1.5" fill="currentColor" fillOpacity={0.6} />
              <path d="M16 27c0 0 2.5 3 5 3s5-3 5-3" strokeWidth={1.5} strokeLinecap="round" />
              <path d="M36 18c0-2 2-4 4-4h10c2 0 4 2 4 4v12c0 6-4 10-9 10s-9-4-9-10V18z" fill="currentColor" fillOpacity={0.2} />
              <circle cx="43" cy="24" r="1.5" fill="currentColor" fillOpacity={0.6} />
              <circle cx="51" cy="24" r="1.5" fill="currentColor" fillOpacity={0.6} />
              <path d="M42 33c0 0 2.5-3 5-3s5 3 5 3" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
            <span className="text-xs text-text-muted/30">Slika nedostupna</span>
          </div>
        ) : (
          <img
            src={event.imageUrl}
            alt={event.title}
            onError={() => setImgError(true)}
            className="h-48 w-full object-cover"
          />
        )}
      </div>

      {/* Description */}
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">{event.description}</p>

      {/* Details grid */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Datum</p>
          <p className="mt-1 text-sm text-text-primary">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Vrijeme</p>
          <p className="mt-1 text-sm text-text-primary">{event.time}h</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Trajanje</p>
          <p className="mt-1 text-sm text-text-primary">{event.duration}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Cijena</p>
          <p className="mt-1 text-sm text-text-primary">{event.pricePerTicket}€ / karta</p>
        </div>
      </div>

      {/* Availability */}
      <div className="mt-5 rounded-sm border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-text-muted">Slobodna mjesta</p>
            <p className={`mt-1 text-sm font-semibold ${isSoldOut ? 'text-text-muted' : isAlmostFull ? 'text-accent-red' : 'text-text-primary'}`}>
              {isSoldOut ? 'Rasprodano' : `${event.availableSeats} / ${event.totalSeats}`}
            </p>
          </div>
          {isAlmostFull && !isSoldOut && (
            <span className="rounded-sm bg-accent-red/10 px-2.5 py-1 text-xs font-semibold text-accent-red">
              Još malo mjesta!
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-sm border border-border-strong px-4 py-3 text-sm font-medium text-text-secondary transition-all hover:border-gold/40"
        >
          Zatvori
        </button>
        <button
          onClick={() => { onClose(); onReserve(event) }}
          disabled={isSoldOut}
          className="flex-1 rounded-sm bg-gold px-4 py-3 text-sm font-semibold text-base transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSoldOut ? 'Rasprodano' : 'Rezerviraj'}
        </button>
      </div>
    </div>
  )
}
