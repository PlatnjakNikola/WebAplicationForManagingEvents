import { mockReviews } from '../../lib/mockData'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-gold' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default function AdminReviews() {
  const reviews = [...mockReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gold md:text-4xl">Sve recenzije</h1>
        <p className="mt-1 text-sm text-text-muted">{reviews.length} recenzija</p>
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase text-text-muted">
              <th className="py-3 pr-4">Korisnik</th>
              <th className="py-3 pr-4">Događaj</th>
              <th className="py-3 pr-4">Kazalište</th>
              <th className="py-3 pr-4">Ocjena</th>
              <th className="py-3 pr-4">Komentar</th>
              <th className="py-3">Datum</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-surface">
                <td className="py-3 pr-4 font-medium text-text-primary">{r.userName}</td>
                <td className="py-3 pr-4 text-text-secondary">{r.eventTitle}</td>
                <td className="py-3 pr-4 text-text-secondary">{r.theaterName}</td>
                <td className="py-3 pr-4">
                  <Stars rating={r.rating} />
                </td>
                <td className="max-w-xs truncate py-3 pr-4 text-text-secondary">
                  {r.comment || '—'}
                </td>
                <td className="py-3 text-text-muted">
                  {new Date(r.createdAt).toLocaleDateString('hr-HR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-sm border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-text-primary">{r.eventTitle}</h3>
                <p className="mt-0.5 text-xs text-text-muted">{r.theaterName}</p>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {r.userName} · {new Date(r.createdAt).toLocaleDateString('hr-HR')}
            </p>
            {r.comment && (
              <p className="mt-2 text-sm text-text-secondary">{r.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
