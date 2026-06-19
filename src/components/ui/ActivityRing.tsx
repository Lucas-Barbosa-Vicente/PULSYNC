'use client'

import { motion } from 'framer-motion'

interface RingData {
  progress: number
  color: string
}

interface ActivityRingProps {
  rings: RingData[]
  size?: number
}

const BASE_RADIUS = 52
const RING_GAP    = 14
const STROKE_W    = 10

export default function ActivityRing({ rings, size = 120 }: ActivityRingProps) {
  const viewBox = 120

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={size}
      height={size}
    >
      {rings.map((ring, i) => {
        const r             = BASE_RADIUS - i * RING_GAP
        const circumference = 2 * Math.PI * r
        const offset        = circumference * (1 - Math.min(ring.progress, 1))

        return (
          <g key={i}>
            <circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={`${ring.color}22`}
              strokeWidth={STROKE_W}
            />
            <motion.circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
              transform={`rotate(-90 ${viewBox / 2} ${viewBox / 2})`}
              style={{ filter: `drop-shadow(0 0 6px ${ring.color})` }}
            />
          </g>
        )
      })}
    </svg>
  )
}
