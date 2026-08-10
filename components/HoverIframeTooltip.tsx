'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface HoverIframeTooltipProps {
  text: React.ReactNode
  iframeSrc: string
  title: string
  className?: string
}

const tooltipWidth = 380
const tooltipHeight = 260

export function HoverIframeTooltip({
  text,
  iframeSrc,
  title,
  className = '',
}: HoverIframeTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)

    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openPreview = () => {
    cancelClose()
    setIsOpen(true)
  }

  const closePreview = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setIsOpen(false), 160)
  }

  let top = mousePos.y - tooltipHeight - 18
  let left = mousePos.x - tooltipWidth / 2

  if (mounted) {
    if (top < 10) top = mousePos.y + 18
    if (left < 10) left = 10
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
  }

  return (
    <>
      <span
        className={`relative inline-block cursor-help border-b border-dotted border-cyan-400 text-cyan-500 transition-colors hover:border-cyan-600 hover:text-cyan-400 dark:border-cyan-500 dark:text-cyan-400 dark:hover:border-cyan-300 dark:hover:text-cyan-300 ${className}`}
        onBlur={closePreview}
        onFocus={openPreview}
        onMouseEnter={openPreview}
        onMouseLeave={closePreview}
        onMouseMove={(event) => setMousePos({ x: event.clientX, y: event.clientY })}
      >
        {text}
      </span>
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed z-[9999]"
            onMouseEnter={openPreview}
            onMouseLeave={closePreview}
            style={{ top, left, width: tooltipWidth, height: tooltipHeight }}
          >
            <div className="h-full w-full overflow-hidden rounded-lg border-2 border-cyan-400 bg-black shadow-2xl dark:border-cyan-500">
              <iframe
                src={iframeSrc}
                title={title}
                loading="lazy"
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default HoverIframeTooltip
