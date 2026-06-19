'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAchievements } from '@/hooks/useAchievements'
import XPBar from '@/components/gamification/XPBar'
import AchievementBadge from '@/components/gamification/AchievementBadge'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'
import type { AchievementWithProgress } from '@/hooks/useAchievements'
import type { Achievement } from '@/types/database.types'

const CATEGORIES: { key: Achievement['category'] | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'workouts', label: 'Treinos' },
  { key: 'social', label: 'Social' },
  { key: 'sleep', label: 'Sono' },
  { key: 'nutrition', label: 'Nutrição' },
]

export default function AchievementsPage() {
  const { user, profile } = useAuth()
  const { unlocked, locked, loading, fetchUserAchievements } = useAchievements()
  const [category, setCategory] = useState<Achievement['category'] | 'all'>('all')
  const [selected, setSelected] = useState<AchievementWithProgress | null>(null)

  useEffect(() => {
    if (user) fetchUserAchievements(user.id)
  }, [user])

  const all = [...unlocked, ...locked]
  const filtered = category === 'all' ? all : all.filter((a) => a.category === category)

  return (
    <div className="pb-4">
      <Header title="Conquistas" />

      <div className="px-4 space-y-4">
        {/* XP Bar */}
        <div className="bg-surface rounded-2xl p-4">
          <XPBar totalXp={profile?.total_xp ?? 0} />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`shrink-0 px-4 h-8 rounded-full text-sm font-medium transition-all ${
                category === cat.key
                  ? 'bg-primary text-bg'
                  : 'bg-surface text-text-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((a) => (
              <AchievementBadge key={a.id} achievement={a} size="md" onClick={() => setSelected(a)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail bottom sheet */}
      {selected && (
        <div
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <AchievementBadge achievement={selected} size="lg" />
            <p className="text-lg font-bold text-text-primary">{selected.name}</p>
            <p className="text-text-secondary text-sm text-center">{selected.description}</p>
            {selected.userAchievement ? (
              <p className="text-xs text-text-muted">
                Desbloqueada em{' '}
                {new Date(selected.userAchievement.unlocked_at).toLocaleDateString('pt-BR')}
              </p>
            ) : (
              <p className="text-primary font-medium">+{selected.xp_reward} XP</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
