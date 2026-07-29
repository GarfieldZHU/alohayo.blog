const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Total&color=5c9cf5&labelColor=6b7280'

export default function VisitorTelemetry() {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span>Visitors</span>
      <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
        <img alt="Total views for alohayo.me" src={counterUrl} height={20} />
      </a>
    </div>
  )
}
