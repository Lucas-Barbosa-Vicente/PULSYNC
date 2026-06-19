'use client'

import { motion } from 'framer-motion'
import type { SleepWithScore } from '@/types/app.types'

interface SleepArcProps {
  session: SleepWithScore
}

const scoreColor = (score: number) => {
  if (score >= 80) return 'var(--primary)'
  if (score >= 60) return 'var(--warning)'
  return 'var(--error)'
}

const W = 200
const H = 110
const R = 80
const CX = W / 2
const CY = H

function arcPath(ratio: number) {
  const startAngle = Math.PI
  const endAngle = startAngle + ratio * Math.PI
  const x1 = CX + R * Math.cos(startAngle)
  const y1 = CY + R * Math.sin(startAngle)
  const x2 = CX + R * Math.cos(endAngle)
  const y2 = CY + R * Math.sin(endAngle)
  const largeArc = ratio > 0.5 ? 1 : 0
  return `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`
}

function fmtHours(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}min`
}

const qualityColors: Record<string, string> = {
  excellent: 'text-primary bg-primary/10',
  good: 'text-success bg-success/10',
  regular: 'text-warning bg-warning/10',
  poor: 'text-error bg-error/10',
}

export default function SleepArc({ session }: SleepArcProps) {
  const score = session.quality_score
  const color = scoreColor(score)
  const progress = Math.min(1, session.duration_minutes / 480)
  const circumference = Math.PI * R

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: W, height: H + 20 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          <path d={arcPath(1)} fill="none" stroke="var(--border)" strokeWidth={12} strokeLinecap="round" />
          <motion.path
            d={arcPath(progress)}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-end justify-end pb-1">
          <div className="flex flex-col items-center w-full">
            <span className="font-mono font-black text-2xl text-text-primary">
              {fmtHours(session.duration_minutes)}
            </span>
          </div>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${qualityColors[session.quality] ?? 'text-text-secondary bg-surface'}`}
      >
        {session.qualityLabel}
      </span>
    </div>
  )
}
