'use client'

import React, { useState, useEffect, useCallback } from 'react'

function isNullWord(word: string) {
  return /null/i.test(word)
}

function getColor(word: string): string {
  return isNullWord(word) ? '#d97070' : '#5bb87a'
}

function getGlow(word: string): string {
  return isNullWord(word)
    ? '0 0 2px #d97070, 0 0 6px #d9707050, 0 0 12px #d9707025'
    : '0 0 2px #5bb87a, 0 0 6px #5bb87a50, 0 0 12px #5bb87a25'
}

export function NeonFlicker({ primary, alternate }: { primary: string; alternate: string }) {
  const [display, setDisplay] = useState(primary)
  const [opacity, setOpacity] = useState(1)

  const flicker = useCallback(() => {
    let timeout: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      timeout = setTimeout(tick, Math.random() * 1200 + 800)
    }

    const tick = () => {
      const roll = Math.random()

      if (roll < 0.45) {
        // Switch to alternate — hold it visibly
        setDisplay(alternate)
        setOpacity(0.9)
        timeout = setTimeout(
          () => {
            // Maybe do a quick double-flicker back and forth
            if (Math.random() < 0.4) {
              setDisplay(primary)
              setOpacity(0.7)
              timeout = setTimeout(
                () => {
                  setDisplay(alternate)
                  setOpacity(1)
                  timeout = setTimeout(
                    () => {
                      setDisplay(primary)
                      setOpacity(1)
                      scheduleNext()
                    },
                    120 + Math.random() * 80
                  )
                },
                60 + Math.random() * 40
              )
            } else {
              setDisplay(primary)
              setOpacity(1)
              scheduleNext()
            }
          },
          200 + Math.random() * 300
        )
      } else if (roll < 0.7) {
        // Brightness flicker on current word
        setOpacity(0.5 + Math.random() * 0.3)
        timeout = setTimeout(
          () => {
            setOpacity(1)
            scheduleNext()
          },
          50 + Math.random() * 40
        )
      } else {
        // Rapid tik-tik-tok pattern
        const steps = 2 + Math.floor(Math.random() * 3)
        let i = 0
        const rapidFlick = () => {
          if (i >= steps) {
            setDisplay(primary)
            setOpacity(1)
            scheduleNext()
            return
          }
          const show = i % 2 === 0 ? alternate : primary
          setDisplay(show)
          setOpacity(0.7 + Math.random() * 0.3)
          i++
          timeout = setTimeout(rapidFlick, 70 + Math.random() * 60)
        }
        rapidFlick()
      }
    }

    timeout = setTimeout(tick, Math.random() * 1500 + 500)
    return () => clearTimeout(timeout)
  }, [primary, alternate])

  useEffect(() => {
    const cleanup = flicker()
    return cleanup
  }, [flicker])

  return (
    <span
      className="inline-block font-medium transition-opacity duration-50"
      style={{
        opacity,
        color: getColor(display),
        textShadow: getGlow(display),
      }}
    >
      {display}
    </span>
  )
}

export function renderNeonText(text: string): React.ReactNode {
  const parts = text.split(/(null-stack|full-stack|NULL|FULL)/g)
  return parts.map((part, i) => {
    if (part === 'null-stack')
      return (
        <span key={i}>
          <NeonFlicker primary="null" alternate="full" />
          {'-stack'}
        </span>
      )
    if (part === 'full-stack')
      return (
        <span key={i}>
          <NeonFlicker primary="full" alternate="null" />
          {'-stack'}
        </span>
      )
    if (part === 'NULL') return <NeonFlicker key={i} primary="NULL" alternate="FULL" />
    if (part === 'FULL') return <NeonFlicker key={i} primary="FULL" alternate="NULL" />
    return part
  })
}
