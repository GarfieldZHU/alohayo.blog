const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Visitors&color=5c9cf5&labelColor=6b7280'

export default function VisitorTelemetry() {
  return (
    <div className="mb-2 flex justify-center">
      <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
        <img
          alt="Total views for alohayo.me"
          className="h-5 w-auto opacity-90 transition-opacity hover:opacity-100 dark:invert"
          src={counterUrl}
          height={20}
        />
      </a>
    </div>
  )
}
