'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { HoverImageTooltip } from './HoverImageTooltip'

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
  const [isZapping, setIsZapping] = useState(false)

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

  useEffect(() => {
    let zapTimeout: ReturnType<typeof setTimeout>
    let activeZapTimeout: ReturnType<typeof setTimeout>

    const scheduleZap = () => {
      zapTimeout = setTimeout(
        () => {
          setIsZapping(true)
          activeZapTimeout = setTimeout(() => {
            setIsZapping(false)
            scheduleZap()
          }, 400) // Zap duration matches animation duration
        },
        Math.random() * 6000 + 3000
      ) // Zap every 3-9 seconds
    }

    scheduleZap()

    return () => {
      clearTimeout(zapTimeout)
      clearTimeout(activeZapTimeout)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes spark-flash {
          0% { opacity: 0; }
          5% { opacity: 1; transform: scale(1.05) skewX(15deg); filter: brightness(2) drop-shadow(0 0 5px #fff) drop-shadow(0 0 15px #0ff); }
          10% { opacity: 0; transform: scale(1); }
          15% { opacity: 1; transform: scale(1.02) translate(-2px, 1px) skewX(-15deg); filter: brightness(2) drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #0ff); }
          25% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes branch-flash {
          0% { opacity: 0; }
          5% { opacity: 1; }
          10% { opacity: 0; }
          15% { opacity: 1; }
          20% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes text-zap {
          0% { filter: brightness(1); }
          5% { filter: brightness(1.5) drop-shadow(0 0 8px #fff); }
          10% { filter: brightness(1); }
          15% { filter: brightness(1.3) drop-shadow(0 0 4px #fff); }
          25% { filter: brightness(1); }
          100% { filter: brightness(1); }
        }

        .electric-arc {
          position: relative;
        }

        .electric-arc.zap {
          animation: text-zap 0.4s ease-out forwards;
        }

        .electric-arc::before, .electric-arc::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          z-index: 10;
          color: transparent;
        }

        .electric-arc.zap::before {
          text-shadow: 2px 0 1px #fff, -1px -1px 4px #0ff, 0 0 10px #0ff;
          clip-path: polygon(0 15%, 100% 5%, 100% 15%, 0 25%);
          animation: spark-flash 0.4s ease-out forwards;
        }

        .electric-arc.zap::after {
          text-shadow: -2px 0 1px #fff, 1px 1px 4px #e0f7fa, 0 0 10px #e0f7fa;
          clip-path: polygon(0 65%, 100% 50%, 100% 70%, 0 80%);
          animation: spark-flash 0.3s ease-out forwards reverse;
        }

        .zap-branch {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          z-index: 20;
        }

        .electric-arc.zap .zap-branch.b1 {
          top: 10%; left: -20%; width: 40%; height: 10px;
          background: white;
          box-shadow: 0 0 8px 2px #0ff;
          clip-path: polygon(0 40%, 40% 40%, 30% 0%, 100% 50%, 60% 50%, 70% 100%);
          animation: branch-flash 0.4s ease-out forwards;
        }

        .electric-arc.zap .zap-branch.b2 {
          top: 60%; right: -20%; width: 40%; height: 12px;
          background: white;
          box-shadow: 0 0 8px 2px #0ff;
          clip-path: polygon(0 50%, 30% 0%, 40% 50%, 100% 40%, 70% 100%, 60% 60%);
          animation: branch-flash 0.4s ease-out forwards 0.05s;
        }
      `}</style>
      <span
        className={`electric-arc inline-block font-medium transition-opacity duration-50 ${isZapping ? 'zap' : ''}`}
        data-text={display}
        style={{
          opacity,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: getColor(display),
          textShadow: getGlow(display),
        }}
      >
        <span className="zap-branch b1"></span>
        <span className="zap-branch b2"></span>
        {display}
      </span>
    </>
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

export function renderGamerText(text: string): React.ReactNode {
  const regex =
    /(Hidetaka Miyazaki|Boletaria|Lands Between|Lordran|Lothric|Yharnam|Ashina Castle|Long may the sun shine! ☀️)/g
  const parts = text.split(regex)

  const imageMap: Record<string, { src: string; funny?: boolean; glow?: boolean }> = {
    'Hidetaka Miyazaki': {
      src: '/static/images/gaming/miyazaki-smile.webp',
      funny: true,
    },
    Boletaria: {
      src: '/static/images/gaming/boletaria.webp',
    },
    'Lands Between': {
      src: '/static/images/gaming/lands-between.webp',
    },
    Lordran: {
      src: '/static/images/gaming/lordran.webp',
    },
    Lothric: {
      src: '/static/images/gaming/lothric.webp',
    },
    Yharnam: {
      src: '/static/images/gaming/yharnam.webp',
    },
    'Ashina Castle': {
      src: '/static/images/gaming/ashina.webp',
    },
    'Long may the sun shine! ☀️': {
      src: '/static/images/gaming/solaire-praise.webp',
      glow: true,
    },
  }

  return parts.map((part, i) => {
    const entry = imageMap[part]
    if (entry) {
      return (
        <HoverImageTooltip
          key={i}
          text={part}
          imageSrc={entry.src}
          funny={entry.funny}
          glow={entry.glow}
        />
      )
    }
    return <React.Fragment key={i}>{renderNeonText(part)}</React.Fragment>
  })
}
