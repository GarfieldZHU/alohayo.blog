const platforms = [
  {
    name: 'PlayStation Network · AlohaYo_Z',
    href: 'https://psnprofiles.com/alohayo_',
    badge:
      'https://img.shields.io/badge/PSN-AlohaYo__Z-0070D1?style=for-the-badge&logo=playstation&logoColor=white',
  },
  {
    name: 'Steam · AlohaYo',
    href: 'https://steamcommunity.com/profiles/76561198092274492',
    badge:
      'https://img.shields.io/badge/Steam-AlohaYo-000000?style=for-the-badge&logo=steam&logoColor=white',
  },
  {
    name: 'Nintendo Switch · SW-7050-4176-3344',
    href: 'https://github.com/GarfieldZHU',
    badge:
      'https://img.shields.io/badge/Switch-SW--7050--4176--3344-E60012?style=for-the-badge&logo=nintendoswitch&logoColor=white',
  },
]

export function GamingPlatforms() {
  return (
    <div className="not-prose no-scrollbar my-9 flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-2">
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noreferrer"
          aria-label={platform.name}
          className="shrink-0 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:rounded-sm"
        >
          {/* External badge assets preserve the official platform marks shown in the reference. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={platform.badge} alt="" className="h-7 w-auto" />
        </a>
      ))}
    </div>
  )
}
