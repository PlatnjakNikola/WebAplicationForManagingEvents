/** Reusable skeleton placeholders for loading states */

function Base({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-base-lighter ${className}`}
    />
  )
}

/** Single line of text */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <Base className={`h-4 ${className}`} />
}

/** Event / theater card skeleton */
export function SkeletonCard() {
  return (
    <div className="rounded-sm border border-border bg-surface p-5">
      <Base className="mb-4 h-40 w-full rounded-sm" />
      <Base className="mb-2 h-5 w-3/4" />
      <Base className="mb-2 h-4 w-1/2" />
      <Base className="h-4 w-1/3" />
    </div>
  )
}

/** Table row skeleton */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <Base className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

/** Full page skeleton with title + grid of cards */
export function SkeletonPage({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <Base className="mb-2 h-9 w-64" />
      <Base className="mb-8 h-4 w-40" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

/** Skeleton for table-based admin pages */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <Base className="mb-2 h-9 w-64" />
      <Base className="mb-6 h-4 w-40" />
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="py-3 pr-4">
                  <Base className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-sm border border-border bg-surface p-4">
            <Base className="mb-2 h-5 w-3/4" />
            <Base className="mb-1 h-3 w-1/2" />
            <Base className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
