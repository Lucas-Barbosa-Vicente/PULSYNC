'use client'

import { motion } from 'framer-motion'

interface CalorieRingProps {
  consumed: number
  goal: number
}

const RADIUS = 60
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CalorieRing({ consumed, goal }: CalorieRingProps) {
  const progress = Math.min(1, consumed / goal)
  const overGoal = consumed > goal
  const strokeColor = overGoal ? 'var(--error)' : 'var(--primary)'
  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: (RADIUS + STROKE) * 2, height: (RADIUS + STROKE) * 2 }}>
        <svg
          width={(RADIUS + STROKE) * 2}
          height={(RADIUS + STROKE) * 2}
          className="-rotate-90"
          viewBox={`0 0 ${(RADIUS + STROKE) * 2} ${(RADIUS + STROKE) * 2}`}
        >
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-black text-2xl text-text-primary">{consumed}</span>
          <span className="text-xs text-text-muted">kcal</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary">Meta: {goal} kcal</p>
    </div>
  )
}
