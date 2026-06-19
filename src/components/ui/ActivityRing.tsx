'use client'

import { motion } from 'framer-motion'

interface RingData {
  progress: number
  color: string
  gradientFrom?: string
  gradientTo?: string
}

interface ActivityRingProps {
  rings: RingData[]
  size?: number
}

const BASE_RADIUS = 64
const RING_GAP    = 18
const STROKE_W    = 15

export default function ActivityRing({ rings, size = 150 }: ActivityRingProps) {
  const viewBox = 160

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <defs>
        {rings.map((ring, i) =>
          ring.gradientFrom && ring.gradientTo ? (
            <linearGradient key={i} id={`ring-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={ring.gradientFrom} />
              <stop offset="1" stopColor={ring.gradientTo} />
            </linearGradient>
          ) : null
        )}
      </defs>

      {rings.map((ring, i) => {
        const r             = BASE_RADIUS - i * RING_GAP
        const circumference = 2 * Math.PI * r
        const offset        = circumference * (1 - Math.min(ring.progress, 1))
        const stroke        = ring.gradientFrom ? `url(#ring-grad-${i})` : ring.color
        const trackColor    = ring.gradientFrom
          ? `${ring.gradientFrom}38`
          : `${ring.color}33`

        return (
          <g key={i}>
            <circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={trackColor}
              strokeWidth={STROKE_W}
            />
            <motion.circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={stroke}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
              transform={`rotate(-90 ${viewBox / 2} ${viewBox / 2})`}
              style={{ filter: `drop-shadow(0 0 6px ${ring.gradientFrom ?? ring.color})` }}
            />
          </g>
        )
      })}
    </svg>
  )
}
