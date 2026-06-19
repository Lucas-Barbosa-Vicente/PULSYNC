'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SleepSession } from '@/types/database.types'
import type { SleepWithScore, SleepQuality } from '@/types/app.types'

function calculateSleepScore(session: SleepSession): number {
  const durationScore = Math.min(1, session.duration_minutes / 480) * 40
  const deepPct = session.deep_sleep_minutes / session.duration_minutes
  const deepScore = Math.min(1, deepPct / 0.15) * 30
  const remPct = session.rem_minutes / session.duration_minutes
  const remScore = Math.min(1, remPct / 0.2) * 20
  return Math.round(durationScore + deepScore + remScore + 5)
}

function qualityLabel(score: number): { quality: SleepQuality; label: string } {
  if (score >= 80) return { quality: 'excellent', label: 'Excelente' }
  if (score >= 60) return { quality: 'good', label: 'Bom' }
  if (score >= 40) return { quality: 'regular', label: 'Regular' }
  return { quality: 'poor', label: 'Ruim' }
}

function estimatePhases(durationMin: number) {
  return {
    deep_sleep_minutes: Math.round(durationMin * 0.15),
    rem_minutes: Math.round(durationMin * 0.2),
    light_sleep_minutes: Math.round(durationMin * 0.5),
    awake_minutes: Math.round(durationMin * 0.15),
  }
}

export function useSleep() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<SleepWithScore[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSleepHistory = useCallback(
    async (userId: string, days = 7) => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('sleep_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('start_time', { ascending: false })
          .limit(days)

        const withScore: SleepWithScore[] = (data ?? []).map((s: SleepSession) => {
          const score = calculateSleepScore(s)
          const { quality, label } = qualityLabel(score)
          return { ...s, quality_score: score, quality, qualityLabel: label }
        })
        setSessions(withScore)
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const logManualSleep = useCallback(
    async (userId: string, startTime: Date, endTime: Date) => {
      const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      const phases = estimatePhases(durationMin)
      const session = {
        user_id: userId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMin,
        quality_score: 0,
        source: 'manual' as const,
        ...phases,
      }
      session.quality_score = calculateSleepScore(session as SleepSession)

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert(session)
        .select()
        .single()

      if (!error && data) {
        const score = calculateSleepScore(data)
        const { quality, label } = qualityLabel(score)
        setSessions((prev) => [{ ...data, quality, qualityLabel: label }, ...prev])
      }
    },
    [supabase]
  )

  return { sessions, loading, fetchSleepHistory, logManualSleep }
}
