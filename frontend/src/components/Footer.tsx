export default function Footer() {
  return (
    <footer className="border-t border-border bg-base">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <p className="text-xs text-text-muted">
          <span className="font-display text-text-secondary">Theatrum</span>{' '}
          &copy; {new Date().getFullYear()}
        </p>
        <p className="text-xs text-text-muted">
          Sva prava pridržana
        </p>
      </div>
    </footer>
  )
}
