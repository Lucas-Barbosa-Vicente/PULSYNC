'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import StreakCounter from '@/components/ui/StreakCounter'
import type { HabitWithStreak } from '@/types/app.types'

interface HabitCardProps {
  habit: HabitWithStreak
  onComplete: () => void
  onUndo: () => void
  onArchive: () => void
}

const statusBorder: Record<string, string> = {
  active: 'border-l-4 border-success',
  'at-risk': 'border-l-4 border-accent',
  broken: 'border-l-4 border-error',
}

export default function HabitCard({ habit, onComplete, onUndo, onArchive }: HabitCardProps) {
  const [dragX, setDragX] = useState(0)
  const showArchive = dragX < -60

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Archive reveal */}
      <AnimatePresence>
        {showArchive && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onArchive}
            className="absolute right-0 top-0 bottom-0 flex items-center px-5 bg-error text-white text-sm font-semibold rounded-r-2xl z-10"
          >
            Arquivar
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={() => setDragX(0)}
        className={`flex items-center gap-3 p-4 bg-surface ${
          !habit.completedToday ? statusBorder[habit.streakStatus] : ''
        }`}
      >
        {/* Checkbox */}
        <motion.button
          onClick={habit.completedToday ? onUndo : onComplete}
          whileTap={{ scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            habit.completedToday
              ? 'bg-primary border-primary'
              : 'border-border'
          }`}
        >
          {habit.completedToday && (
            <span className="text-bg text-xs font-bold">✓</span>
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{habit.icon}</span>
            <p
              className={`font-medium text-sm truncate ${
                habit.completedToday ? 'line-through text-text-muted' : 'text-text-primary'
              }`}
            >
              {habit.name}
            </p>
          </div>
        </div>

        {/* Streak */}
        {habit.streak && (
          <StreakCounter
            count={habit.streak.current_count}
            status={habit.streakStatus}
            className="shrink-0"
          />
        )}
      </motion.div>
    </div>
  )
}
