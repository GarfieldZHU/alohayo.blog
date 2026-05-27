'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface HoverImageTooltipProps {
  text: React.ReactNode
  imageSrc: string
  funny?: boolean
  glow?: boolean
  className?: string
}

export function HoverImageTooltip({
  text,
  imageSrc,
  funny,
  glow,
  className = '',
}: HoverImageTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const tooltipWidth = funny ? 200 : glow ? 180 : 420
  const tooltipHeight = funny ? 200 : glow ? 240 : 240

  let top = mousePos.y - tooltipHeight - 20
  let left = mousePos.x - tooltipWidth / 2

  if (mounted) {
    if (top < 10) {
      top = mousePos.y + 20
    }
    if (left < 10) {
      left = 10
    } else if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
  }

  return (
    <>
      <span
        className={`relative inline-block cursor-help border-b border-dotted transition-colors ${
          funny
            ? 'font-bold border-gray-400 hover:border-gray-800 dark:border-gray-500 dark:hover:border-gray-200'
            : glow
              ? 'italic border-gray-400 hover:border-gray-800 dark:border-gray-500 dark:hover:border-gray-200'
              : 'border-cyan-400 text-cyan-500 hover:border-cyan-600 hover:text-cyan-400 dark:border-cyan-500 dark:text-cyan-400 dark:hover:border-cyan-300 dark:hover:text-cyan-300'
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {text}
      </span>
      {mounted &&
        isHovered &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{
              top: top,
              left: left,
              width: tooltipWidth,
              height: tooltipHeight,
              // Subtle parallax based on screen position
              transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 15}px, ${(mousePos.y / window.innerHeight - 0.5) * 15}px)`,
            }}
          >
            <style>{`
            @keyframes htWobble {
              0%, 100% { transform: rotate(-3deg) scale(1); }
              50% { transform: rotate(3deg) scale(1.05); }
            }
            @keyframes htFadeIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
            <div
              className={`relative h-full w-full overflow-hidden rounded-sm border-2 border-gray-800 bg-black dark:border-gray-600`}
              style={{
                animation: funny
                  ? 'htFadeIn 0.2s ease-out forwards, htWobble 2s ease-in-out infinite alternate'
                  : 'htFadeIn 0.2s ease-out forwards',
                boxShadow: glow
                  ? '0 0 30px rgba(251,191,36,0.6), inset 0 0 20px rgba(251,191,36,0.2)'
                  : '0 15px 35px rgba(0,0,0,0.5)',
                borderColor: glow ? 'rgba(251,191,36,0.5)' : undefined,
              }}
            >
              {/* Vignette overlay */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-black/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
              {/* Film grain noise overlay */}
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
              />

              <img
                src={imageSrc}
                alt={typeof text === 'string' ? text : 'tooltip image'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
