'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  color?: string
  height?: number
  label?: string
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({
  progress,
  color,
  height = 6,
  label,
  showLabel,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress))

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showLabel && (
            <span className="text-xs text-text-secondary">{Math.round(clamped * 100)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-surface-high"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color ?? 'var(--primary)' }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
