import { useState } from 'react'
import { mockTheaters } from '../../lib/mockData'
import toast from 'react-hot-toast'
import type { Theater } from '../../types'

const emptyForm = {
  name: '',
  address: '',
  description: '',
  capacity: '',
  contact: '',
  workingHours: '',
}

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>

function hasDoubleSpaces(value: string): boolean {
  return /\s{2,}/.test(value)
}

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState<Theater[]>(mockTheaters)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = theaters.length > 0 && selected.size === theaters.length

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(theaters.map((t) => t.id)))
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    if (!window.confirm(`Obrisati ${selected.size} odabranih kazališta?`)) return
    setTheaters((prev) => prev.filter((t) => !selected.has(t.id)))
    toast.success(`Obrisano ${selected.size} kazališta.`)
    setSelected(new Set())
  }

  function openAdd() {
    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(t: Theater) {
    setForm({
      name: t.name,
      address: t.address,
      description: t.description,
      capacity: String(t.capacity),
      contact: t.contact,
      workingHours: t.workingHours,
    })
    setErrors({})
    setEditingId(t.id)
    setShowForm(true)
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Naziv je obavezan'
    else if (hasDoubleSpaces(form.name)) errs.name = 'Naziv ne smije imati duple razmake'
    if (!form.address.trim()) errs.address = 'Adresa je obavezna'
    else if (hasDoubleSpaces(form.address)) errs.address = 'Adresa ne smije imati duple razmake'
    const cap = Number(form.capacity)
    if (!form.capacity.trim()) errs.capacity = 'Kapacitet je obavezan'
    else if (!Number.isInteger(cap) || cap < 1) errs.capacity = 'Mora biti najmanje 1'
    else if (cap > 99999) errs.capacity = 'Maksimalno 99999'
    if (!form.contact.trim()) errs.contact = 'Kontakt je obavezan'
    else if (hasDoubleSpaces(form.contact)) errs.contact = 'Kontakt ne smije imati duple razmake'
    if (form.description.trim() && hasDoubleSpaces(form.description)) errs.description = 'Opis ne smije imati duple razmake'
    if (form.workingHours.trim() && hasDoubleSpaces(form.workingHours)) errs.workingHours = 'Ne smije imati duple razmake'
    return errs
  }

  function validateField(field: string, value: string): string | undefined {
    if ((field === 'name' || field === 'address' || field === 'contact' || field === 'description' || field === 'workingHours') && hasDoubleSpaces(value)) {
      return 'Ne smije imati duple razmake'
    }
    if (field === 'capacity' && value.trim()) {
      const n = Number(value)
      if (!Number.isInteger(n) || n < 1) return 'Mora biti najmanje 1'
      if (n > 99999) return 'Maksimalno 99999'
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Ispravite označena polja.')
      return
    }

    const name = form.name.trim()
    const address = form.address.trim()
    const description = form.description.trim()
    const contact = form.contact.trim()
    const workingHours = form.workingHours.trim()
    const capacity = Number(form.capacity)

    if (editingId) {
      setTheaters((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name, address, description, capacity, contact, workingHours }
            : t
        )
      )
      toast.success('Kazalište je ažurirano.')
    } else {
      setTheaters((prev) => [
        { id: String(Date.now()), name, address, description, capacity, contact, workingHours, latitude: 0, longitude: 0 },
        ...prev,
      ])
      toast.success('Kazalište je dodano.')
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  function handleDelete(id: string) {
    if (!window.confirm('Obrisati ovo kazalište?')) return
    setTheaters((prev) => prev.filter((t) => t.id !== id))
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
    toast.success('Kazalište je obrisano.')
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Upravljanje kazalištima</h1>
          <p className="mt-1 text-sm text-text-muted">{theaters.length} kazališta</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="rounded-sm border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm font-semibold text-accent-red transition-colors hover:bg-accent-red/20"
            >
              Obriši odabrane ({selected.size})
            </button>
          )}
          <button onClick={openAdd} className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-gold-light">
            + Dodaj kazalište
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-sm border border-border-strong bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {editingId ? 'Uredi kazalište' : 'Novo kazalište'}
          </h2>
          <div className="mt-5 space-y-5">
            {/* Red 1: Naziv | Adresa */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label="Naziv *" value={form.name} onChange={(v) => updateField('name', v)} error={errors.name} maxLength={100} />
              <Input label="Adresa *" value={form.address} onChange={(v) => updateField('address', v)} error={errors.address} maxLength={200} />
            </div>

            {/* Red 2: Kapacitet + Kontakt | Radno vrijeme */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input label="Kapacitet *" type="number" value={form.capacity} onChange={(v) => updateField('capacity', v)} error={errors.capacity} min="1" max="99999" />
                <Input label="Kontakt *" value={form.contact} onChange={(v) => updateField('contact', v)} error={errors.contact} maxLength={100} />
              </div>
              <Input label="Radno vrijeme" value={form.workingHours} onChange={(v) => updateField('workingHours', v)} error={errors.workingHours} placeholder="npr. Pon-Pet: 10:00-20:00" maxLength={100} />
            </div>

            {/* Red 3: Opis */}
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

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pl-3 pr-4">Naziv</th>
              <th className="py-3 pr-4">Adresa</th>
              <th className="py-3 pr-4">Kapacitet</th>
              <th className="py-3 pr-4">Kontakt</th>
              <th className="py-3 pr-3 text-right">
                <span className="mr-3">Akcije</span>
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded-sm border-border accent-gold align-middle opacity-50 hover:opacity-100 transition-opacity" />
              </th>
            </tr>
          </thead>
          <tbody>
            {theaters.map((t) => (
              <tr key={t.id} className={`border-b border-border/50 transition-colors hover:bg-surface ${selected.has(t.id) ? 'bg-gold/5' : ''}`}>
                <td className="py-3 pl-3 pr-4 font-medium text-text-primary">{t.name}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.address}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.capacity}</td>
                <td className="py-3 pr-4 text-text-secondary">{t.contact}</td>
                <td className="py-3 pr-3 text-right">
                  <button onClick={() => openEdit(t)} className="mr-3 text-accent-blue hover:underline">Uredi</button>
                  <button onClick={() => handleDelete(t.id)} className="mr-3 text-accent-red hover:underline">Obriši</button>
                  <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                    className="h-4 w-4 cursor-pointer rounded-sm border-border accent-gold align-middle opacity-50 hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {theaters.map((t) => (
          <div key={t.id} className={`rounded-sm border bg-surface p-4 ${selected.has(t.id) ? 'border-gold/40 bg-gold/5' : 'border-border'}`}>
            <h3 className="font-display font-semibold text-text-primary">{t.name}</h3>
            <p className="mt-0.5 text-xs text-text-muted">{t.address}</p>
            <p className="mt-1 text-xs text-text-secondary">Kapacitet: {t.capacity}</p>
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => openEdit(t)} className="text-xs font-medium text-accent-blue hover:underline">Uredi</button>
              <button onClick={() => handleDelete(t.id)} className="text-xs font-medium text-accent-red hover:underline">Obriši</button>
              <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                className="ml-auto h-4 w-4 cursor-pointer rounded-sm border-border accent-gold opacity-50 hover:opacity-100 transition-opacity" />
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
        className={`mt-1.5 h-[42px] w-full rounded-sm border bg-base-light px-3 text-sm text-text-primary outline-none focus:border-gold ${
          type === 'number' ? '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' : ''
        } ${error ? 'border-accent-red' : 'border-border'}`} />
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </div>
  )
}
