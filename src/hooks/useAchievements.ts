'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Achievement, UserAchievement } from '@/types/database.types'
import type { LeaderboardEntry } from '@/types/app.types'
import { levelFromXp } from '@/constants/gamification'

export type AchievementWithProgress = Achievement & {
  userAchievement?: UserAchievement
  progress?: number
  progressTarget?: number
}

export function useAchievements() {
  const supabase = createClient()
  const [unlocked, setUnlocked] = useState<AchievementWithProgress[]>([])
  const [locked, setLocked] = useState<AchievementWithProgress[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUserAchievements = useCallback(
    async (userId: string) => {
      setLoading(true)
      try {
        const [achRes, userAchRes] = await Promise.all([
          supabase.from('achievements').select('*').order('created_at'),
          supabase.from('user_achievements').select('*').eq('user_id', userId),
        ])

        const all = (achRes.data ?? []) as Achievement[]
        const userAchs = (userAchRes.data ?? []) as UserAchievement[]
        const unlockedIds = new Set(userAchs.map((u) => u.achievement_id))

        const withProgress: AchievementWithProgress[] = all.map((a) => {
          const ua = userAchs.find((u) => u.achievement_id === a.id)
          return { ...a, userAchievement: ua }
        })

        setUnlocked(withProgress.filter((a) => unlockedIds.has(a.id)))
        setLocked(withProgress.filter((a) => !unlockedIds.has(a.id)))
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const addXP = useCallback(
    async (userId: string, amount: number) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level')
        .eq('id', userId)
        .single()

      if (!profile) return { newXp: 0, newLevel: 1, levelUp: false }

      const newXp = profile.total_xp + amount
      const newLevel = levelFromXp(newXp)
      const levelUp = newLevel > profile.level

      await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', userId)

      return { newXp, newLevel, levelUp }
    },
    [supabase]
  )

  const fetchLeaderboard = useCallback(
    async (userIds: string[]): Promise<LeaderboardEntry[]> => {
      if (userIds.length === 0) return []
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, total_xp, level')
        .in('id', userIds)
        .order('total_xp', { ascending: false })

      return (data ?? []).map((p: { id: string; display_name: string; avatar_url?: string; total_xp: number; level: number }, i: number) => ({
        userId: p.id,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        totalXp: p.total_xp,
        level: p.level,
        position: i + 1,
      }))
    },
    [supabase]
  )

  return { unlocked, locked, loading, fetchUserAchievements, addXP, fetchLeaderboard }
}
