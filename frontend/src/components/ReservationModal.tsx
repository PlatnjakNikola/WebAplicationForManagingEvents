import { useState, useEffect } from 'react'
import type { Event } from '../types'
import toast from 'react-hot-toast'

interface ReservationModalProps {
  event: Event | null
  onClose: () => void
  onConfirm?: (eventId: string, ticketCount: number) => void
}

export default function ReservationModal({ event, onClose, onConfirm }: ReservationModalProps) {
  const [tickets, setTickets] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isOpen = !!event
  const maxTickets = event ? Math.min(event.availableSeats, 10) : 1
  const totalPrice = event ? tickets * event.pricePerTicket : 0

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTickets(1)
      setShowConfirm(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!event) return null

  const formattedDate = new Date(event.date).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setIsSubmitting(false)
    onConfirm?.(event.id, tickets)
    onClose()
    toast.success(`Rezervirano ${tickets} ${tickets === 1 ? 'karta' : 'karata'} za "${event.title}"`)
  }

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
          className={`w-full max-w-md rounded-sm border border-border bg-base-light shadow-2xl transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalContent
            event={event}
            tickets={tickets}
            setTickets={setTickets}
            maxTickets={maxTickets}
            totalPrice={totalPrice}
            formattedDate={formattedDate}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[90] rounded-t-2xl border-t border-border bg-base-light transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-text-muted/30" />
        </div>
        <ModalContent
          event={event}
          tickets={tickets}
          setTickets={setTickets}
          maxTickets={maxTickets}
          totalPrice={totalPrice}
          formattedDate={formattedDate}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </div>
    </>
  )
}

function ModalContent({
  event,
  tickets,
  setTickets,
  maxTickets,
  totalPrice,
  formattedDate,
  showConfirm,
  setShowConfirm,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  event: Event
  tickets: number
  setTickets: (n: number) => void
  maxTickets: number
  totalPrice: number
  formattedDate: string
  showConfirm: boolean
  setShowConfirm: (v: boolean) => void
  isSubmitting: boolean
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <div className="px-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between py-5 border-b border-border">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">Rezervacija</h2>
          <p className="mt-0.5 text-sm text-text-muted">Odaberite broj karata</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Event info */}
      <div className="mt-5 rounded-sm border border-border bg-surface p-4">
        <h3 className="font-display text-lg font-semibold text-gold">{event.title}</h3>
        <div className="mt-2 space-y-1 text-sm text-text-secondary">
          <p>{event.theaterName}</p>
          <p>{formattedDate} u {event.time}h</p>
          <p className="text-text-muted">Dostupno mjesta: {event.availableSeats}</p>
        </div>
      </div>

      {/* Ticket selector */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-text-secondary">Broj karata</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTickets(Math.max(1, tickets - 1))}
            disabled={tickets <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border-strong text-text-secondary transition-all hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>

          <span className="font-display text-2xl font-bold text-text-primary w-12 text-center">
            {tickets}
          </span>

          <button
            onClick={() => setTickets(Math.min(maxTickets, tickets + 1))}
            disabled={tickets >= maxTickets}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border-strong text-text-secondary transition-all hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <span className="text-sm text-text-muted">
            × {event.pricePerTicket}€
          </span>
        </div>
      </div>

      {/* Summary / Confirm */}
      {!showConfirm ? (
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Ukupno</p>
            <p className="font-display text-2xl font-bold text-gold">{totalPrice}€</p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-base transition-all hover:bg-gold-light"
          >
            Nastavi
          </button>
        </div>
      ) : (
        <div className="mt-6">
          {/* Confirmation summary */}
          <div className="rounded-sm border border-gold/20 bg-gold/5 p-4">
            <p className="text-sm font-medium text-text-primary mb-2">Potvrda rezervacije</p>
            <p className="text-sm text-text-secondary">
              {tickets}× {event.title} — {event.theaterName}
            </p>
            <p className="text-sm text-text-secondary">
              {formattedDate} u {event.time}h
            </p>
            <p className="mt-2 font-display text-lg font-bold text-gold">
              Ukupno: {totalPrice}€
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
              className="flex-1 rounded-sm border border-border-strong px-4 py-3 text-sm font-medium text-text-secondary transition-all hover:border-gold/40 disabled:opacity-50"
            >
              Natrag
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-sm bg-gold px-4 py-3 text-sm font-semibold text-base transition-all hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Rezerviram...
                </span>
              ) : (
                'Potvrdi rezervaciju'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
