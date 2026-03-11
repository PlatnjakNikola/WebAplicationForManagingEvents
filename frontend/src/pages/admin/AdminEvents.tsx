import { useState } from 'react'
import { mockEvents, mockTheaters } from '../../lib/mockData'
import toast from 'react-hot-toast'
import type { Event } from '../../types'


const emptyForm = {
  title: '',
  description: '',
  theaterId: '',
  date: '',
  timeHour: '',
  timeMinute: '',
  pricePerTicket: '',
  totalSeats: '',
  duration: '',
  imageUrl: '',
}

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>

function hasDoubleSpaces(value: string): boolean {
  return /\s{2,}/.test(value)
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}.`
}

function parseDurationToMinutes(dur: string): string {
  const hMatch = dur.match(/(\d+)\s*h/)
  const mMatch = dur.match(/(\d+)\s*min/)
  const hours = hMatch ? Number(hMatch[1]) : 0
  const mins = mMatch ? Number(mMatch[1]) : 0
  const total = hours * 60 + mins
  return total > 0 ? String(total) : dur
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const today = todayStr()

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
      timeHour: (event.time || '').split(':')[0] || '',
      timeMinute: (event.time || '').split(':')[1] || '',
      pricePerTicket: String(event.pricePerTicket),
      totalSeats: String(event.totalSeats),
      duration: parseDurationToMinutes(event.duration),
      imageUrl: event.imageUrl,
    })
    setErrors({})
    setEditingId(event.id)
    setShowForm(true)
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.title.trim()) errs.title = 'Naziv je obavezan'
    else if (hasDoubleSpaces(form.title)) errs.title = 'Naziv ne smije imati duple razmake'
    if (!form.theaterId) errs.theaterId = 'Kazalište je obavezno'
    if (!form.date) errs.date = 'Datum je obavezan'
    else if (form.date < today) errs.date = 'Datum ne smije biti u prošlosti'
    const h = Number(form.timeHour), m = Number(form.timeMinute)
    if (!form.timeHour || !form.timeMinute) errs.timeHour = 'Vrijeme je obavezno'
    else if (h < 0 || h > 23 || !Number.isInteger(h)) errs.timeHour = 'Sat: 0–23'
    else if (m < 0 || m > 59 || !Number.isInteger(m)) errs.timeHour = 'Minute: 0–59'
    const price = Number(form.pricePerTicket)
    if (!form.pricePerTicket.trim()) errs.pricePerTicket = 'Cijena je obavezna'
    else if (price < 1) errs.pricePerTicket = 'Cijena mora biti najmanje 1 €'
    else if (price > 9999) errs.pricePerTicket = 'Maksimalno 9999 €'

    const seats = Number(form.totalSeats)
    if (!form.totalSeats.trim()) errs.totalSeats = 'Ukupno mjesta je obavezno'
    else if (!Number.isInteger(seats) || seats < 1) errs.totalSeats = 'Mora biti najmanje 1 mjesto (cijeli broj)'
    else if (seats > 99999) errs.totalSeats = 'Maksimalno 99999 mjesta'
    if (form.description.trim() && hasDoubleSpaces(form.description)) errs.description = 'Opis ne smije imati duple razmake'
    const dur = Number(form.duration)
    if (!form.duration.trim()) errs.duration = 'Trajanje je obavezno'
    else if (dur < 1) errs.duration = 'Trajanje mora biti veće od 0'
    else if (!Number.isInteger(dur)) errs.duration = 'Trajanje mora biti cijeli broj'
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
    const title = form.title.trim()
    const description = form.description.trim()
    const duration = formatDuration(Number(form.duration))

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
                time: `${form.timeHour}:${form.timeMinute}`,
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
        time: `${form.timeHour}:${form.timeMinute}`,
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

  function validateField(field: string, value: string): string | undefined {
    if (field === 'date' && value && value < today) return 'Datum ne smije biti u prošlosti'
    if (field === 'title' || field === 'description' || field === 'duration') {
      if (hasDoubleSpaces(value)) return 'Ne smije imati duple razmake'
    }
    if (field === 'pricePerTicket' && value.trim()) {
      const n = Number(value)
      if (n < 1) return 'Cijena mora biti najmanje 1 €'
      if (n > 9999) return 'Maksimalno 9999 €'
    }
    if (field === 'totalSeats' && value.trim()) {
      const n = Number(value)
      if (!Number.isInteger(n) || n < 1) return 'Mora biti najmanje 1 mjesto (cijeli broj)'
      if (n > 99999) return 'Maksimalno 99999 mjesta'
    }
    return undefined
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    const err = validateField(field, value)
    if (err) {
      setErrors((prev) => ({ ...prev, [field]: err }))
    } else if (errors[field as keyof FormErrors]) {
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
        <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-border-strong bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {editingId ? 'Uredi događaj' : 'Novi događaj'}
          </h2>
          <div className="mt-5 space-y-5">
            {/* Red 1: Naziv | Kazalište */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label="Naziv *" value={form.title} onChange={(v) => updateField('title', v)} error={errors.title} maxLength={100} />
              <div>
                <label className="block text-sm font-medium text-text-secondary">Kazalište *</label>
                <select
                  value={form.theaterId}
                  onChange={(e) => updateField('theaterId', e.target.value)}
                  className={`mt-1.5 w-full rounded-sm border bg-base-light px-3 py-2.5 text-sm text-text-primary outline-none focus:border-gold ${
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
            </div>

            {/* Red 2: Datum | Vrijeme (sat : min) | Trajanje | Cijena */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">Datum * <span className="font-normal text-text-muted">(dd.mm.yyyy.)</span></label>
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => updateField('date', e.target.value)}
                  className={`mt-1.5 w-full rounded-sm border bg-base-light px-3 py-2.5 text-sm text-text-primary outline-none focus:border-gold [color-scheme:dark] ${
                    errors.date ? 'border-accent-red' : 'border-border'
                  }`}
                />
                {errors.date && <p className="mt-1 text-xs text-accent-red">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Vrijeme *</label>
                <div className={`mt-1.5 flex items-center gap-2 rounded-sm border bg-base-light px-3 py-2.5 ${
                  errors.timeHour ? 'border-accent-red' : 'border-border'
                }`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="HH"
                    value={form.timeHour}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); updateField('timeHour', v) }}
                    className="w-full bg-transparent text-center text-sm text-text-primary outline-none placeholder:text-text-muted/50"
                  />
                  <span className="text-base font-semibold text-text-muted">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="MM"
                    value={form.timeMinute}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); updateField('timeMinute', v) }}
                    className="w-full bg-transparent text-center text-sm text-text-primary outline-none placeholder:text-text-muted/50"
                  />
                </div>
                {errors.timeHour && <p className="mt-1 text-xs text-accent-red">{errors.timeHour}</p>}
              </div>
              <Input label="Trajanje * (min)" type="number" value={form.duration} onChange={(v) => updateField('duration', v)} error={errors.duration} min="1" />
              <Input label="Cijena (€) *" type="number" value={form.pricePerTicket} onChange={(v) => updateField('pricePerTicket', v)} error={errors.pricePerTicket} min="1" max="9999" />
            </div>

            {/* Red 3: Ukupno mjesta | Slika URL (širi) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_3fr]">
              <Input label="Ukupno mjesta *" type="number" value={form.totalSeats} onChange={(v) => updateField('totalSeats', v)} error={errors.totalSeats} min="1" max="99999" />
              <Input label="Slika URL" value={form.imageUrl} onChange={(v) => updateField('imageUrl', v)} maxLength={500} />
            </div>

            {/* Red 4: Opis */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                maxLength={500}
                className={`mt-1.5 w-full resize-none rounded-sm border bg-base-light px-3 py-2.5 text-sm text-text-primary outline-none focus:border-gold ${
                  errors.description ? 'border-accent-red' : 'border-border'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-accent-red">{errors.description}</p>}
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
                <td className="py-3 pr-4 text-text-secondary">{formatDate(event.date)}</td>
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
                <p className="mt-0.5 text-xs text-text-muted">{event.theaterName} · {formatDate(event.date)}</p>
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

function Input({ label, value, onChange, type = 'text', placeholder, error, min, max, maxLength }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string; min?: string; max?: string; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} maxLength={maxLength}
        className={`mt-1.5 w-full rounded-sm border bg-base-light px-3 py-2.5 text-sm text-text-primary outline-none focus:border-gold ${
          type === 'number' ? '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' : ''
        } ${error ? 'border-accent-red' : 'border-border'}`} />
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </div>
  )
}
