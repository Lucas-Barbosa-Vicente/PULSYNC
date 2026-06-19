'use client'

import { motion } from 'framer-motion'
import { Play, Music2, Timer } from 'lucide-react'

interface WorkoutTypeCardProps {
  id: string
  name: string
  icon: string
  onStart: (id: string) => void
}

export default function WorkoutTypeCard({ id, name, icon, onStart }: WorkoutTypeCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="rounded-[20px] p-5"
      style={{ background: 'var(--workout-bg)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-5xl">{icon}</span>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onStart(id)}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--workout-icon)' }}
        >
          <Play size={18} color="#000" fill="#000" />
        </motion.button>
      </div>

      <p className="mt-3 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        {name}
      </p>

      <div className="flex gap-3 mt-3">
        {[
          { Icon: Music2, label: 'Música' },
          { Icon: Timer,  label: 'Tempo'  },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Icon size={16} color="var(--workout-icon)" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
