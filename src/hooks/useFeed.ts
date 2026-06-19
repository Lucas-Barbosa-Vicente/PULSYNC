'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityFeed } from '@/types/database.types'
import type { DaySummary } from '@/types/app.types'
import { format } from 'date-fns'

const PAGE_SIZE = 15

export type FeedItem = ActivityFeed & {
  profile: { display_name: string; avatar_url?: string }
  hasKudos: boolean
}

export function useFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const supabase = createClient()

  const fetchFriendsFeed = useCallback(
    async (userId: string, nextCursor?: string | null) => {
      setLoading(true)
      try {
        let query = supabase
          .from('activity_feed')
          .select('*, profile:profiles(display_name, avatar_url)')
          .or(`user_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE)

        if (nextCursor) {
          query = query.lt('created_at', nextCursor)
        }

        const { data, error } = await query
        if (error) throw error

        const withKudos: FeedItem[] = (data ?? []).map((item: ActivityFeed & { profile: unknown }) => ({
          ...(item as ActivityFeed),
          profile: Array.isArray(item.profile)
            ? (item.profile[0] as { display_name: string; avatar_url?: string })
            : (item.profile as { display_name: string; avatar_url?: string }),
          hasKudos: false,
        }))

        setItems((prev) => (nextCursor ? [...prev, ...withKudos] : withKudos))
        setHasMore((data?.length ?? 0) === PAGE_SIZE)
        if (data && data.length > 0) {
          setCursor(data[data.length - 1].created_at)
        }
      } catch {
        // silently fail — UI shows empty state
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const loadMore = useCallback(
    (userId: string) => {
      if (!loading && hasMore) {
        fetchFriendsFeed(userId, cursor)
      }
    },
    [loading, hasMore, cursor, fetchFriendsFeed]
  )

  const fetchDaySummary = useCallback(
    async (userId: string, date: Date): Promise<DaySummary> => {
      const dateStr = format(date, 'yyyy-MM-dd')

      const [workoutsRes, habitsRes, habitsLogRes, mealsRes, sleepRes, stepsRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('start_time', `${dateStr}T00:00:00`)
          .lt('start_time', `${dateStr}T23:59:59`),
        supabase
          .from('habits')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true),
        supabase
          .from('habit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('completed_at', `${dateStr}T00:00:00`)
          .lt('completed_at', `${dateStr}T23:59:59`),
        supabase
          .from('meals')
          .select('total_calories')
          .eq('user_id', userId)
          .gte('logged_at', `${dateStr}T00:00:00`)
          .lt('logged_at', `${dateStr}T23:59:59`),
        supabase
          .from('sleep_sessions')
          .select('duration_minutes')
          .eq('user_id', userId)
          .order('start_time', { ascending: false })
          .limit(1),
        supabase
          .from('step_logs')
          .select('steps')
          .eq('user_id', userId)
          .eq('date', dateStr)
          .maybeSingle(),
      ])

      const workoutDone = (workoutsRes.count ?? 0) > 0
      const habitsTotal = habitsRes.count ?? 0
      const habitsCompleted = habitsLogRes.count ?? 0
      const caloriesConsumed = (mealsRes.data ?? []).reduce(
        (sum: number, m: { total_calories: number }) => sum + (m.total_calories ?? 0),
        0
      )
      const caloriesGoal = 2000
      const sleepHours = ((sleepRes.data?.[0]?.duration_minutes ?? 0) / 60)
      const sleepGoal = 8
      const stepsCount = stepsRes.data?.steps ?? 0

      const workoutProgress = workoutDone ? 1 : 0
      const habitProgress = habitsTotal > 0 ? habitsCompleted / habitsTotal : 0
      const calProgress = Math.min(1, caloriesConsumed / caloriesGoal)
      const sleepProgress = Math.min(1, sleepHours / sleepGoal)
      const overallProgress = (workoutProgress + habitProgress + calProgress + sleepProgress) / 4

      return {
        workoutDone,
        habitsCompleted,
        habitsTotal,
        caloriesConsumed,
        caloriesGoal,
        sleepHours,
        sleepGoal,
        overallProgress,
        stepsCount,
      }
    },
    [supabase]
  )

  const toggleKudos = useCallback(
    async (feedItemId: string, userId: string) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== feedItemId) return item
          const newHasKudos = !item.hasKudos
          return {
            ...item,
            hasKudos: newHasKudos,
            kudos_count: item.kudos_count + (newHasKudos ? 1 : -1),
          }
        })
      )

      const existing = await supabase
        .from('kudos')
        .select('id')
        .eq('feed_item_id', feedItemId)
        .eq('user_id', userId)
        .single()

      if (existing.data) {
        await supabase.from('kudos').delete().eq('id', existing.data.id)
        await supabase
          .from('activity_feed')
          .update({ kudos_count: supabase.rpc('decrement', { x: 1 }) as unknown as number })
          .eq('id', feedItemId)
      } else {
        await supabase.from('kudos').insert({ feed_item_id: feedItemId, user_id: userId })
        await supabase.rpc('increment_kudos', { feed_id: feedItemId })
      }
    },
    [supabase]
  )

  return { items, loading, hasMore, fetchFriendsFeed, loadMore, fetchDaySummary, toggleKudos }
}
