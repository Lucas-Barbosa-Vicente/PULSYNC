'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from '@/components/ui/Avatar'
import type { LeaderboardEntry } from '@/types/app.types'

interface RankCardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

const podiumHeight = ['h-24', 'h-20', 'h-16']
const podiumRing = ['ring-gold', 'ring-silver', 'ring-bronze']
const podiumBg = ['bg-gold/10', 'bg-silver/10', 'bg-bronze/10']

export default function RankCard({ entries, currentUserId }: RankCardProps) {
  const [filter] = useState<'all' | 'month' | 'week'>('all')

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="bg-surface rounded-2xl p-4 space-y-4">
      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3">
          {[1, 0, 2].map((podiumIdx) => {
            const entry = top3[podiumIdx]
            if (!entry) return <div key={podiumIdx} className="flex-1" />
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.1 }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                {entry.position === 1 && <span className="text-lg">👑</span>}
                <Avatar
                  size="lg"
                  name={entry.displayName}
                  uri={entry.avatarUrl}
                  className={`ring-2 ${podiumRing[podiumIdx]}`}
                />
                <p className="text-xs text-text-primary font-medium truncate max-w-[72px] text-center">
                  {entry.displayName}
                </p>
                <div
                  className={`w-full ${podiumHeight[podiumIdx]} ${podiumBg[podiumIdx]} rounded-t-xl flex items-start justify-center pt-2`}
                >
                  <span className="text-sm font-bold text-text-secondary">#{entry.position}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Rest */}
      {rest.map((entry) => (
        <div
          key={entry.userId}
          className={`flex items-center gap-3 p-3 rounded-xl ${
            entry.userId === currentUserId ? 'bg-surface-high ring-1 ring-primary' : ''
          }`}
        >
          <span className="text-text-muted font-mono w-6 text-sm">#{entry.position}</span>
          <Avatar size="sm" name={entry.displayName} uri={entry.avatarUrl} />
          <p className="flex-1 text-sm text-text-primary truncate">{entry.displayName}</p>
          <span className="text-text-secondary text-sm">{entry.totalXp} XP</span>
        </div>
      ))}
    </div>
  )
}
