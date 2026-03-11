import { useState } from 'react'
import { mockEvents, mockTheaters } from '../../lib/mockData'
import toast from 'react-hot-toast'
import type { Event } from '../../types'

const emptyForm = {
  title: '',
  description: '',
  theaterId: '',
  date: '',
  time: '',
  pricePerTicket: '',
  totalSeats: '',
  duration: '',
  imageUrl: '',
}

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>

function sanitize(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ')
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})

  function openAdd() {
    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(event: Event) {
    setForm({
      title: event.title,
      description: event.description,
      theaterId: event.theaterId,
      date: event.date,
      time: event.time,
      pricePerTicket: String(event.pricePerTicket),
      totalSeats: String(event.totalSeats),
      duration: event.duration,
      imageUrl: event.imageUrl,
    })
    setErrors({})
    setEditingId(event.id)
    setShowForm(true)
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!sanitize(form.title)) errs.title = 'Naziv je obavezan'
    if (!form.theaterId) errs.theaterId = 'Kazalište je obavezno'
    if (!form.date) errs.date = 'Datum je obavezan'
    if (!form.time.trim()) errs.time = 'Vrijeme je obavezno'
    if (!form.pricePerTicket.trim()) errs.pricePerTicket = 'Cijena je obavezna'
    if (!form.totalSeats.trim()) errs.totalSeats = 'Ukupno mjesta je obavezno'
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Ispravite označena polja.')
      return
    }

    const theater = mockTheaters.find((t) => t.id === form.theaterId)
    const totalSeats = Number(form.totalSeats)
    const title = sanitize(form.title)
    const description = sanitize(form.description)
    const duration = sanitize(form.duration)

    if (editingId) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingId
            ? {
                ...ev,
                title,
                description,
                theaterId: form.theaterId,
                theaterName: theater?.name || '',
                date: form.date,
                time: form.time.trim(),
                pricePerTicket: Number(form.pricePerTicket),
                totalSeats,
                duration,
                imageUrl: form.imageUrl.trim(),
              }
            : ev
        )
      )
      toast.success('Događaj je ažuriran.')
    } else {
      const newEvent: Event = {
        id: String(Date.now()),
        title,
        description,
        theaterId: form.theaterId,
        theaterName: theater?.name || '',
        date: form.date,
        time: form.time.trim(),
        pricePerTicket: Number(form.pricePerTicket),
        totalSeats,
        availableSeats: totalSeats,
        imageUrl: form.imageUrl.trim() || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop',
        duration,
      }
      setEvents((prev) => [newEvent, ...prev])
      toast.success('Događaj je dodan.')
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  function handleDelete(id: string) {
    if (!window.confirm('Obrisati ovaj događaj?')) return
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
    toast.success('Događaj je obrisan.')
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as keyof FormErrors]
        return next
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">
            Upravljanje događajima
          </h1>
          <p className="mt-1 text-sm text-text-muted">{events.length} događaja</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-gold-light"
        >
          + Dodaj događaj
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-border-strong bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {editingId ? 'Uredi događaj' : 'Novi događaj'}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Naziv *" value={form.title} onChange={(v) => updateField('title', v)} error={errors.title} />
            <div>
              <label className="block text-sm font-medium text-text-secondary">Kazalište *</label>
              <select
                value={form.theaterId}
                onChange={(e) => updateField('theaterId', e.target.value)}
                className={`mt-1 w-full rounded-sm border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold ${
                  errors.theaterId ? 'border-accent-red' : 'border-border'
                }`}
              >
                <option value="">Odaberite...</option>
                {mockTheaters.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.theaterId && <p className="mt-1 text-xs text-accent-red">{errors.theaterId}</p>}
            </div>
            <Input label="Datum *" type="date" value={form.date} onChange={(v) => updateField('date', v)} error={errors.date} />
            <Input label="Vrijeme *" type="time" value={form.time} onChange={(v) => updateField('time', v)} error={errors.time} />
            <Input label="Cijena (€) *" type="number" value={form.pricePerTicket} onChange={(v) => updateField('pricePerTicket', v)} error={errors.pricePerTicket} />
            <Input label="Ukupno mjesta *" type="number" value={form.totalSeats} onChange={(v) => updateField('totalSeats', v)} error={errors.totalSeats} />
            <Input label="Trajanje" value={form.duration} onChange={(v) => updateField('duration', v)} placeholder="npr. 2h 30min" />
            <Input label="Slika URL" value={form.imageUrl} onChange={(v) => updateField('imageUrl', v)} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-base hover:bg-gold-light">
              {editingId ? 'Spremi' : 'Dodaj'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setErrors({}) }} className="rounded-sm border border-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary">
              Odustani
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pl-3 pr-4">Naziv</th>
              <th className="py-3 pr-4">Kazalište</th>
              <th className="py-3 pr-4">Datum</th>
              <th className="py-3 pr-4">Cijena</th>
              <th className="py-3 pr-4">Mjesta</th>
              <th className="py-3 pr-3 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-border/50 transition-colors hover:bg-surface">
                <td className="py-3 pl-3 pr-4 font-medium text-text-primary">{event.title}</td>
                <td className="py-3 pr-4 text-text-secondary">{event.theaterName}</td>
                <td className="py-3 pr-4 text-text-secondary">{event.date}</td>
                <td className="py-3 pr-4 text-gold">{event.pricePerTicket} €</td>
                <td className="py-3 pr-4 text-text-secondary">{event.availableSeats}/{event.totalSeats}</td>
                <td className="py-3 pr-3 text-right">
                  <button onClick={() => openEdit(event)} className="mr-3 text-accent-blue hover:underline">Uredi</button>
                  <button onClick={() => handleDelete(event.id)} className="text-accent-red hover:underline">Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {events.map((event) => (
          <div key={event.id} className="rounded-sm border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-text-primary">{event.title}</h3>
                <p className="mt-0.5 text-xs text-text-muted">{event.theaterName} · {event.date}</p>
              </div>
              <span className="text-sm font-medium text-gold">{event.pricePerTicket} €</span>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={() => openEdit(event)} className="text-xs font-medium text-accent-blue hover:underline">Uredi</button>
              <button onClick={() => handleDelete(event.id)} className="text-xs font-medium text-accent-red hover:underline">Obriši</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`mt-1 w-full rounded-sm border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold ${
          error ? 'border-accent-red' : 'border-border'
        }`} />
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </div>
  )
}
