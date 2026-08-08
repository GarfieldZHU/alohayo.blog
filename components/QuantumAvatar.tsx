'use client'

import Image from 'next/image'
import { PointerEvent, useRef } from 'react'

interface QuantumAvatarProps {
  src: string
  alt: string
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const QuantumAvatar = ({ src, alt }: QuantumAvatarProps) => {
  const avatarRef = useRef<HTMLDivElement>(null)

  const updatePointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || !avatarRef.current) return

    const bounds = avatarRef.current.getBoundingClientRect()
    const x = clamp((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2), -1, 1)
    const y = clamp((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2), -1, 1)

    avatarRef.current.style.setProperty('--quantum-x', x.toFixed(3))
    avatarRef.current.style.setProperty('--quantum-y', y.toFixed(3))
  }

  const resetPointerPosition = () => {
    if (!avatarRef.current) return

    avatarRef.current.style.setProperty('--quantum-x', '0')
    avatarRef.current.style.setProperty('--quantum-y', '0')
  }

  return (
    <div
      ref={avatarRef}
      className="quantum-avatar"
      role="img"
      aria-label={alt}
      onPointerMove={updatePointerPosition}
      onPointerLeave={resetPointerPosition}
    >
      <div className="quantum-avatar__field" aria-hidden="true">
        <span className="quantum-avatar__orbit quantum-avatar__orbit--wide">
          <span className="quantum-avatar__particle quantum-avatar__particle--pink" />
          <span className="quantum-avatar__particle quantum-avatar__particle--cyan" />
        </span>
        <span className="quantum-avatar__orbit quantum-avatar__orbit--tight">
          <span className="quantum-avatar__particle quantum-avatar__particle--violet" />
          <span className="quantum-avatar__particle quantum-avatar__particle--pearl" />
        </span>
      </div>
      <div className="quantum-avatar__image-shell">
        <span className="quantum-avatar__sheen" aria-hidden="true" />
        <Image
          src={src}
          alt=""
          width={192}
          height={192}
          className="relative z-[1] h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
  )
}

export default QuantumAvatar
