const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Visitors&color=f6339a&labelColor=5e5e5e'

export default function VisitorTelemetry() {
  return (
    <div className="mb-2 flex justify-center">
      <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
        <img
          alt="Total views for alohayo.me"
          className="visitor-counter-badge h-5 w-auto opacity-95 transition-opacity hover:opacity-100"
          src={counterUrl}
          height={20}
        />
      </a>
    </div>
  )
}
