'use client'

import { motion } from 'framer-motion'
import { levelFromXp, xpToNextLevel, progressToNextLevel, levelTitle } from '@/constants/gamification'
import { cn } from '@/lib/utils'

interface XPBarProps {
  totalXp: number
  compact?: boolean
}

function levelColor(level: number): string {
  if (level <= 5) return '#9CA3AF'
  if (level <= 10) return 'var(--success)'
  if (level <= 20) return '#60A5FA'
  return 'var(--social)'
}

export default function XPBar({ totalXp, compact }: XPBarProps) {
  const level = levelFromXp(totalXp)
  const toNext = xpToNextLevel(totalXp)
  const progress = progressToNextLevel(totalXp)
  const color = levelColor(level)
  const title = levelTitle(level)

  if (compact) {
    return (
      <span className="text-sm text-text-secondary">
        Nv.{level} · <span className="text-text-primary">{totalXp} XP</span>
      </span>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="px-3 py-1 rounded-full text-xs font-bold text-bg"
          style={{ backgroundColor: color }}
        >
          Nível {level}
        </div>
        <span className="text-xs text-text-muted">{toNext} XP para Nível {level + 1}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-high overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, var(--primary), var(--social))` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className={cn('text-xs', 'text-text-muted')}>{title}</p>
    </div>
  )
}
