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

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openAdd() {
    setForm(emptyForm)
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
    setEditingId(event.id)
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.theaterId || !form.date) {
      return toast.error('Popunite obavezna polja.')
    }

    const theater = mockTheaters.find((t) => t.id === form.theaterId)
    const totalSeats = Number(form.totalSeats) || 100

    if (editingId) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingId
            ? {
                ...ev,
                title: form.title,
                description: form.description,
                theaterId: form.theaterId,
                theaterName: theater?.name || '',
                date: form.date,
                time: form.time,
                pricePerTicket: Number(form.pricePerTicket) || 0,
                totalSeats,
                duration: form.duration,
                imageUrl: form.imageUrl,
              }
            : ev
        )
      )
      toast.success('Događaj je ažuriran.')
    } else {
      const newEvent: Event = {
        id: String(Date.now()),
        title: form.title,
        description: form.description,
        theaterId: form.theaterId,
        theaterName: theater?.name || '',
        date: form.date,
        time: form.time,
        pricePerTicket: Number(form.pricePerTicket) || 0,
        totalSeats,
        availableSeats: totalSeats,
        imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop',
        duration: form.duration,
      }
      setEvents((prev) => [newEvent, ...prev])
      toast.success('Događaj je dodan.')
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleDelete(id: string) {
    if (!window.confirm('Obrisati ovaj događaj?')) return
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
    toast.success('Događaj je obrisan.')
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
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
            <Input label="Naziv *" value={form.title} onChange={(v) => updateField('title', v)} />
            <div>
              <label className="block text-sm font-medium text-text-secondary">Kazalište *</label>
              <select
                value={form.theaterId}
                onChange={(e) => updateField('theaterId', e.target.value)}
                className="mt-1 w-full rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold"
              >
                <option value="">Odaberite...</option>
                {mockTheaters.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <Input label="Datum *" type="date" value={form.date} onChange={(v) => updateField('date', v)} />
            <Input label="Vrijeme" type="time" value={form.time} onChange={(v) => updateField('time', v)} />
            <Input label="Cijena (€)" type="number" value={form.pricePerTicket} onChange={(v) => updateField('pricePerTicket', v)} />
            <Input label="Ukupno mjesta" type="number" value={form.totalSeats} onChange={(v) => updateField('totalSeats', v)} />
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
            <button type="button" onClick={() => setShowForm(false)} className="rounded-sm border border-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary">
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

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold" />
    </div>
  )
}
