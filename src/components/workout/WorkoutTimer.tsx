'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkoutTimerProps {
  isActive: boolean
  isPaused: boolean
  elapsedSeconds: number
}

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WorkoutTimer({ isActive, isPaused, elapsedSeconds }: WorkoutTimerProps) {
  const color = !isActive
    ? 'text-text-secondary'
    : isPaused
    ? 'text-accent'
    : 'text-primary'

  return (
    <motion.div
      animate={isActive && !isPaused ? { opacity: [1, 0.85, 1] } : { opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity }}
      className={cn('font-mono font-black text-6xl text-center tabular-nums', color)}
    >
      {formatTime(elapsedSeconds)}
    </motion.div>
  )
}
