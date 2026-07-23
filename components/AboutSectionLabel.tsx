type AboutSectionLabelProps = {
  label: 'engineer' | 'gamer'
}

const variants = {
  engineer: {
    prefix: 'NULL-STACK',
    suffix: 'ENGINEER',
    accent: 'bg-[#8f68d8] text-white dark:bg-[#a987e8]',
  },
  gamer: {
    prefix: 'FULL-STACK',
    suffix: 'GAMER',
    accent: 'bg-[#5f994d] text-white dark:bg-[#77ad65]',
  },
}

export function AboutSectionLabel({ label }: AboutSectionLabelProps) {
  const variant = variants[label]

  return (
    <h2 className="not-prose my-10 flex w-fit overflow-hidden rounded-sm shadow-[0_7px_24px_-14px_rgba(15,23,42,0.8)] ring-1 ring-black/5 dark:ring-white/10">
      <span className="bg-gray-700 px-4 py-2.5 font-mono text-xs font-medium tracking-[0.14em] text-gray-100 sm:text-sm dark:bg-gray-600">
        {variant.prefix}
      </span>
      <span
        className={`px-4 py-2.5 font-mono text-xs font-bold tracking-[0.14em] sm:text-sm ${variant.accent}`}
      >
        {variant.suffix}
      </span>
    </h2>
  )
}
