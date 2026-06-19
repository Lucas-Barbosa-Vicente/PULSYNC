'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { StepLog } from '@/types/database.types'

export function useSteps() {
  const supabase = createClient()
  const [logs, setLogs] = useState<StepLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStepHistory = useCallback(
    async (userId: string, days = 7) => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('step_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(days)
        setLogs(data ?? [])
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const logSteps = useCallback(
    async (userId: string, steps: number) => {
      const date = format(new Date(), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('step_logs')
        .upsert({ user_id: userId, date, steps }, { onConflict: 'user_id,date' })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setLogs((prev) => {
          const idx = prev.findIndex((l) => l.date === date)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = data
            return next
          }
          return [data, ...prev]
        })
      }
    },
    [supabase]
  )

  return { logs, loading, fetchStepHistory, logSteps }
}
