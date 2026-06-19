'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AchievementWithProgress } from '@/hooks/useAchievements'

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl'

interface AchievementBadgeProps {
  achievement: AchievementWithProgress
  size?: BadgeSize
  onClick?: () => void
}

const sizeMap: Record<BadgeSize, { outer: string; text: string; name: string }> = {
  sm: { outer: 'w-12 h-12 text-xl', text: 'text-[9px]', name: 'max-w-[48px]' },
  md: { outer: 'w-16 h-16 text-2xl', text: 'text-[10px]', name: 'max-w-[64px]' },
  lg: { outer: 'w-20 h-20 text-3xl', text: 'text-xs', name: 'max-w-[80px]' },
  xl: { outer: 'w-28 h-28 text-5xl', text: 'text-sm', name: 'max-w-[112px]' },
}

const tierStyle: Record<string, string> = {
  bronze: 'ring-2 ring-bronze shadow-[0_0_12px_rgba(205,127,50,0.4)] bg-bronze/10',
  silver: 'ring-2 ring-silver shadow-[0_0_12px_rgba(192,192,192,0.4)] bg-silver/10',
  gold: 'ring-2 ring-gold shadow-[0_0_12px_rgba(255,215,0,0.4)] bg-gold/10',
  platinum: 'ring-2 ring-social shadow-[0_0_14px_rgba(168,85,247,0.5)] bg-social/10',
}

export default function AchievementBadge({ achievement, size = 'md', onClick }: AchievementBadgeProps) {
  const sz = sizeMap[size]
  const locked = !achievement.userAchievement

  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <motion.div
        animate={locked ? {} : { boxShadow: ['0 0 0px rgba(0,212,170,0)', '0 0 8px rgba(0,212,170,0.3)', '0 0 0px rgba(0,212,170,0)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          'relative rounded-full flex items-center justify-center',
          sz.outer,
          tierStyle[achievement.tier] ?? 'ring-2 ring-border bg-surface',
          locked && 'grayscale opacity-40'
        )}
      >
        <span>{achievement.icon}</span>
        {locked && (
          <div className="absolute inset-0 rounded-full bg-bg/60 flex items-center justify-center">
            <span className="text-sm">🔒</span>
          </div>
        )}
      </motion.div>
      <p className={cn('text-text-secondary text-center leading-tight', sz.text, sz.name)}>
        {achievement.name}
      </p>
      {locked && achievement.progress !== undefined && achievement.progressTarget && (
        <p className={cn('text-text-muted text-center', sz.text)}>
          {achievement.progress}/{achievement.progressTarget}
        </p>
      )}
    </div>
  )
}
