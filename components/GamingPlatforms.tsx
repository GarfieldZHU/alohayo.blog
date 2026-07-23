const platforms = [
  {
    name: 'PlayStation Network',
    handle: 'AlohaYo_Z',
    href: 'https://psnprofiles.com/alohayo_',
    tone: 'border-[#0070d1]/20 bg-[#0070d1]/8 text-[#0764b7] dark:border-[#4ba3ef]/25 dark:bg-[#4ba3ef]/10 dark:text-[#82c2f6]',
  },
  {
    name: 'Steam',
    handle: 'AlohaYo',
    href: 'https://steamcommunity.com/profiles/76561198092274492',
    tone: 'border-gray-300 bg-gray-900 text-white dark:border-white/15 dark:bg-white dark:text-gray-950',
  },
  {
    name: 'Nintendo Switch',
    handle: 'SW-7050-4176-3344',
    href: 'https://github.com/GarfieldZHU',
    tone: 'border-[#e60012]/20 bg-[#e60012]/8 text-[#c80010] dark:border-[#ff6370]/25 dark:bg-[#e60012]/10 dark:text-[#ff929b]',
  },
]

export function GamingPlatforms() {
  return (
    <section className="not-prose my-8 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Find me in-game</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${platform.tone}`}
          >
            <span>{platform.name}</span>
            <span className="font-mono text-[10px] opacity-70">{platform.handle}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  )
}
