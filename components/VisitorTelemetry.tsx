const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=flat-square&label=Visitors&color=76515f&labelColor=405a73'

export default function VisitorTelemetry() {
  return (
    <div className="mb-2 flex justify-center">
      <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
        <img
          alt="Total views for alohayo.me"
          className="h-5 w-auto opacity-95 brightness-150 saturate-75 transition-[filter,opacity] hover:opacity-100 dark:brightness-100 dark:saturate-100"
          src={counterUrl}
          height={20}
        />
      </a>
    </div>
  )
}
