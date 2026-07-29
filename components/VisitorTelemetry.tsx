const counterUrl =
  'https://hits.sh/alohayo.me.svg?view=total&style=for-the-badge&label=TOTAL%20VIEWS&color=5c9cf5&labelColor=212121'

export default function VisitorTelemetry() {
  return (
    <section aria-label="Visitor telemetry" className="mt-12 flex justify-center">
      <div className="w-full max-w-sm border border-gray-200 bg-gray-50 p-4 font-mono shadow-sm hover:shadow-[0_0_24px_rgba(92,156,245,0.18)] dark:border-gray-700 dark:bg-[#212121]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-gray-500 uppercase dark:text-[#7b7f87]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Site traffic
          </span>
          <span className="text-orange-600 dark:text-[#fab283]">Live</span>
        </div>
        <div className="mt-3 flex justify-center">
          <a href="https://hits.sh/alohayo.me/" aria-label="Open alohayo.me view statistics">
            <img alt="Total views for alohayo.me" src={counterUrl} height={28} />
          </a>
        </div>
        <p className="mt-3 text-center text-[10px] tracking-[0.08em] text-gray-500 dark:text-[#7b7f87]">
          privacy-first · no cookies
        </p>
      </div>
    </section>
  )
}
