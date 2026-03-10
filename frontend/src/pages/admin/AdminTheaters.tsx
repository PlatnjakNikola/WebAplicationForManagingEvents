import { useState } from 'react'
import { mockTheaters } from '../../lib/mockData'
import toast from 'react-hot-toast'
import type { Theater } from '../../types'

const emptyForm = {
  name: '', address: '', description: '', capacity: '', contact: '', workingHours: '', latitude: '', longitude: '',
}

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState<Theater[]>(mockTheaters)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openAdd() { setForm(emptyForm); setEditingId(null); setShowForm(true) }

  function openEdit(t: Theater) {
    setForm({ name: t.name, address: t.address, description: t.description, capacity: String(t.capacity), contact: t.contact, workingHours: t.workingHours, latitude: String(t.latitude), longitude: String(t.longitude) })
    setEditingId(t.id); setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.address) return toast.error('Popunite obavezna polja.')
    if (editingId) {
      setTheaters((prev) => prev.map((t) => t.id === editingId ? { ...t, name: form.name, address: form.address, description: form.description, capacity: Number(form.capacity) || 0, contact: form.contact, workingHours: form.workingHours, latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0 } : t))
      toast.success('Kazalište je ažurirano.')
    } else {
      setTheaters((prev) => [{ id: String(Date.now()), name: form.name, address: form.address, description: form.description, capacity: Number(form.capacity) || 0, contact: form.contact, workingHours: form.workingHours, latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0 }, ...prev])
      toast.success('Kazalište je dodano.')
    }
    setShowForm(false); setEditingId(null); setForm(emptyForm)
  }

  function handleDelete(id: string) {
    if (!window.confirm('Obrisati ovo kazalište?')) return
    setTheaters((prev) => prev.filter((t) => t.id !== id))
    toast.success('Kazalište je obrisano.')
  }

  function updateField(field: string, value: string) { setForm((prev) => ({ ...prev, [field]: value })) }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Upravljanje kazalištima</h1>
          <p className="mt-1 text-sm text-text-muted">{theaters.length} kazališta</p>
        </div>
        <button onClick={openAdd} className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-gold-light">+ Dodaj kazalište</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-border-strong bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-text-primary">{editingId ? 'Uredi kazalište' : 'Novo kazalište'}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Naziv *" value={form.name} onChange={(v) => updateField('name', v)} />
            <Input label="Adresa *" value={form.address} onChange={(v) => updateField('address', v)} />
            <Input label="Kapacitet" type="number" value={form.capacity} onChange={(v) => updateField('capacity', v)} />
            <Input label="Kontakt" value={form.contact} onChange={(v) => updateField('contact', v)} />
            <Input label="Radno vrijeme" value={form.workingHours} onChange={(v) => updateField('workingHours', v)} placeholder="npr. Pon-Pet: 10:00-20:00" />
            <Input label="Latitude" type="number" value={form.latitude} onChange={(v) => updateField('latitude', v)} />
            <Input label="Longitude" type="number" value={form.longitude} onChange={(v) => updateField('longitude', v)} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">Opis</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-sm border border-border bg-base-light px-3 py-2 text-sm text-text-primary outline-none focus:border-gold" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-base hover:bg-gold-light">{editingId ? 'Spremi' : 'Dodaj'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-sm border border-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary">Odustani</button>
          </div>
        </form>
      )}

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pr-4">Naziv</th><th className="py-3 pr-4">Adresa</th><th className="py-3 pr-4">Kapacitet</th><th className="py-3 pr-4">Kontakt</th><th className="py-3 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {theaters.map((t) => (
              <tr key={t.id} className="border-b border-border/50 transition-colors hover:bg-surface">
                <td className="py-3 pr-4 font-medium text-text-primary">{t.name}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.address}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.capacity}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.contact}</td>
                <td className="py-3 text-right">
                  <button onClick={() => openEdit(t)} className="mr-3 text-accent-blue hover:underline">Uredi</button>
                  <button onClick={() => handleDelete(t.id)} className="text-accent-red hover:underline">Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {theaters.map((t) => (
          <div key={t.id} className="rounded-sm border border-border bg-surface p-4">
            <h3 className="font-display font-semibold text-text-primary">{t.name}</h3>
            <p className="mt-0.5 text-xs text-text-muted">{t.address}</p>
            <p className="mt-1 text-xs text-text-secondary">Kapacitet: {t.capacity}</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => openEdit(t)} className="text-xs font-medium text-accent-blue hover:underline">Uredi</button>
              <button onClick={() => handleDelete(t.id)} className="text-xs font-medium text-accent-red hover:underline">Obriši</button>
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
