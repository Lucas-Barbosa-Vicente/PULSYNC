'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, startOfDay, endOfDay, isYesterday } from 'date-fns'
import type { Habit, HabitLog, Streak } from '@/types/database.types'
import type { HabitWithStreak, StreakStatus } from '@/types/app.types'

function calcStreakStatus(streak: Streak | null): StreakStatus {
  if (!streak || !streak.last_completed_date) return 'broken'
  const last = new Date(streak.last_completed_date)
  if (isYesterday(last) || format(last, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
    return streak.current_count >= 7 ? 'active' : 'at-risk'
  }
  return 'broken'
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStreak[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchTodayHabits = useCallback(
    async (userId: string) => {
      setLoading(true)
      try {
        const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss")
        const todayEnd = format(endOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss")

        const { data: habitsData, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('order_index')

        if (error) throw error

        const habitIds = (habitsData ?? []).map((h: Habit) => h.id)

        const [logsRes, streaksRes] = await Promise.all([
          supabase
            .from('habit_logs')
            .select('*')
            .in('habit_id', habitIds)
            .gte('completed_at', todayStart)
            .lte('completed_at', todayEnd),
          supabase.from('streaks').select('*').in('habit_id', habitIds),
        ])

        const logsByHabit: Record<string, HabitLog> = {}
        for (const log of logsRes.data ?? []) {
          logsByHabit[log.habit_id] = log
        }

        const streaksByHabit: Record<string, Streak> = {}
        for (const s of streaksRes.data ?? []) {
          if (s.habit_id) streaksByHabit[s.habit_id] = s
        }

        const result: HabitWithStreak[] = (habitsData ?? []).map((h: Habit) => {
          const streak = streaksByHabit[h.id] ?? null
          const todayLog = logsByHabit[h.id]
          return {
            ...h,
            streak,
            streakStatus: calcStreakStatus(streak),
            completedToday: !!todayLog,
            todayLog,
          }
        })

        setHabits(result)
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const completeHabit = useCallback(
    async (habitId: string, userId: string, value?: number) => {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, completedToday: true } : h
        )
      )
      try {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          value: value ?? null,
          source: 'manual',
        })
      } catch {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId ? { ...h, completedToday: false } : h
          )
        )
      }
    },
    [supabase]
  )

  const undoComplete = useCallback(
    async (habitId: string, userId: string) => {
      const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm:ss")
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, completedToday: false, todayLog: undefined } : h
        )
      )
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', todayStart)
    },
    [supabase]
  )

  const fetchWeekProgress = useCallback(
    async (userId: string, habitId: string): Promise<boolean[]> => {
      const today = new Date()
      const weekStart = subDays(today, 6)
      const { data } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .gte('completed_at', format(weekStart, "yyyy-MM-dd'T'HH:mm:ss"))

      const doneDays = new Set(
        (data ?? []).map((l: { completed_at: string }) => format(new Date(l.completed_at), 'yyyy-MM-dd'))
      )
      return Array.from({ length: 7 }, (_, i) =>
        doneDays.has(format(subDays(today, 6 - i), 'yyyy-MM-dd'))
      )
    },
    [supabase]
  )

  const createHabit = useCallback(
    async (
      userId: string,
      data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'archived_at' | 'order_index' | 'is_active'>
    ) => {
      const maxOrder = habits.length > 0 ? Math.max(...habits.map((h) => h.order_index)) + 1 : 0
      const { data: created, error } = await supabase
        .from('habits')
        .insert({ ...data, user_id: userId, is_active: true, order_index: maxOrder })
        .select()
        .single()
      if (error) throw error
      await supabase.from('streaks').insert({
        user_id: userId,
        habit_id: created.id,
        current_count: 0,
        longest_count: 0,
      })
    },
    [supabase, habits]
  )

  const archiveHabit = useCallback(
    async (habitId: string) => {
      await supabase
        .from('habits')
        .update({ is_active: false, archived_at: new Date().toISOString() })
        .eq('id', habitId)
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    },
    [supabase]
  )

  const completedCount = habits.filter((h) => h.completedToday).length

  return {
    habits,
    loading,
    completedCount,
    fetchTodayHabits,
    completeHabit,
    undoComplete,
    fetchWeekProgress,
    createHabit,
    archiveHabit,
  }
}
