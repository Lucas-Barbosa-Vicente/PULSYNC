'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useFeed } from '@/hooks/useFeed'
import PageHeader from '@/components/layout/PageHeader'
import ActivityRing from '@/components/ui/ActivityRing'
import MetricCard from '@/components/ui/MetricCard'
import Skeleton from '@/components/ui/Skeleton'
import ActivityCard from '@/components/feed/ActivityCard'
import { formatDate } from '@/lib/utils'
import { staggerContainer, cardEntrance } from '@/lib/animations'
import { METRIC_COLORS } from '@/constants/theme'
import type { DaySummary } from '@/types/app.types'

function buildBarData(value: number, max: number): number[] {
  const slots       = 24
  const filledSlots = Math.round((value / Math.max(max, 1)) * slots)
  return Array.from({ length: slots }, (_, i) => {
    const frac = i >= slots - filledSlots ? Math.random() * 0.6 + 0.4 : Math.random() * 0.2
    return Math.round(frac * max)
  })
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const { items, loading, hasMore, fetchFriendsFeed, loadMore, fetchDaySummary, toggleKudos } =
    useFeed()
  const [summary, setSummary]             = useState<DaySummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    if (!user) return
    fetchFriendsFeed(user.id)
    setSummaryLoading(true)
    fetchDaySummary(user.id, today).then((s) => {
      setSummary(s)
      setSummaryLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'você'
  const dayLabel    = formatDate(today, "EEEE, d 'de' MMM.")

  const habitsProgress  = summary && summary.habitsTotal > 0
    ? summary.habitsCompleted / summary.habitsTotal
    : 0
  const workoutProgress = summary?.workoutDone ? 1 : 0
  const calorieProgress = Math.min((summary?.caloriesConsumed ?? 0) / 2000, 1)
  const sleepProgress   = Math.min((summary?.sleepHours ?? 0) / 8, 1)

  const rings = [
    { progress: calorieProgress,  color: METRIC_COLORS.move    },
    { progress: workoutProgress,  color: METRIC_COLORS.workout  },
    { progress: habitsProgress,   color: METRIC_COLORS.dist     },
    { progress: sleepProgress,    color: METRIC_COLORS.sleep    },
  ]

  const metricCards = [
    {
      title:    'Hábitos',
      subtitle: 'Hoje',
      value:    `${summary?.habitsCompleted ?? 0}/${summary?.habitsTotal ?? 0}`,
      unit:     '',
      color:    METRIC_COLORS.steps,
      data:     buildBarData(summary?.habitsCompleted ?? 0, Math.max(summary?.habitsTotal ?? 1, 1)),
      href:     '/habits',
    },
    {
      title:    'Distância',
      subtitle: 'Hoje',
      value:    '0',
      unit:     'km',
      color:    METRIC_COLORS.dist,
      data:     buildBarData(0, 10),
      href:     '/workout',
    },
    {
      title:    'Calorias',
      subtitle: 'Hoje',
      value:    summary?.caloriesConsumed ?? 0,
      unit:     'kcal',
      color:    METRIC_COLORS.move,
      data:     buildBarData(summary?.caloriesConsumed ?? 0, 2000),
      href:     '/nutrition',
    },
    {
      title:    'Sono',
      subtitle: 'Ontem',
      value:    summary?.sleepHours ? summary.sleepHours.toFixed(1) : '--',
      unit:     'h',
      color:    METRIC_COLORS.sleep,
      data:     buildBarData((summary?.sleepHours ?? 0) * 60, 480),
      href:     '/sleep',
    },
  ]

  return (
    <div className="pb-28">
      <PageHeader
        title="Resumo"
        subtitle={dayLabel}
        avatarName={displayName}
        avatarUri={profile?.avatar_url}
      />

      <div className="px-4 space-y-4 mt-2">

        {/* Círculo de Atividade */}
        {summaryLoading ? (
          <Skeleton className="h-44 w-full rounded-[20px]" />
        ) : (
          <motion.div
            variants={cardEntrance}
            initial="initial"
            animate="animate"
            className="rounded-[20px] p-5"
            style={{ background: 'var(--surface)' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Círculo de Atividade
            </p>
            <div className="flex items-center gap-5">
              <ActivityRing rings={rings} size={110} />
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: 'Movimento', value: `${summary?.caloriesConsumed ?? 0}/2000`, unit: 'CAL', color: METRIC_COLORS.move    },
                  { label: 'Treino',    value: workoutProgress > 0 ? 'Feito' : 'Pendente', unit: '',    color: METRIC_COLORS.workout },
                  { label: 'Hábitos',   value: `${summary?.habitsCompleted ?? 0}/${summary?.habitsTotal ?? 0}`, unit: '', color: METRIC_COLORS.dist },
                  { label: 'Sono',      value: summary?.sleepHours ? `${summary.sleepHours.toFixed(1)}h` : '--', unit: '', color: METRIC_COLORS.sleep },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {m.label}
                    </p>
                    <p className="font-mono font-bold text-base" style={{ color: m.color }}>
                      {m.value}
                      {m.unit && <span className="text-xs ml-0.5">{m.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid 2×2 de MetricCards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-[20px]" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </motion.div>
        )}

        {/* Feed */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="title-section">Atividade Recente</h2>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-[20px]" />
            <Skeleton className="h-24 w-full rounded-[20px]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="text-4xl mb-3">🌱</span>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhuma atividade ainda.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Comece um treino ou complete um hábito!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                onKudos={() => user && toggleKudos(item.id, user.id)}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => user && loadMore(user.id)}
                disabled={loading}
                className="w-full py-3 text-sm disabled:opacity-50"
                style={{ color: 'var(--primary)' }}
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
