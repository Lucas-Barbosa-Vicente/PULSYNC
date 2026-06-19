'use client'

import { motion } from 'framer-motion'

interface StatsGridProps {
  stats: {
    workouts: number
    habitsPercent: number
    achievements: number
    level: number
  }
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    { label: 'Treinos', value: stats.workouts },
    { label: 'Hábitos', value: `${stats.habitsPercent}%` },
    { label: 'Conquistas', value: stats.achievements },
    { label: 'Nível', value: stats.level },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className="bg-surface rounded-2xl p-4 text-center"
        >
          <p className="text-text-primary font-black text-3xl">{item.value}</p>
          <p className="text-text-muted text-xs mt-1">{item.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
