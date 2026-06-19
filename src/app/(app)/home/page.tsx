'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Moon, Flame, Footprints } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFeed } from '@/hooks/useFeed'
import ActivityRing from '@/components/ui/ActivityRing'
import type { DaySummary } from '@/types/app.types'

const CARD_STYLE = {
  background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
  borderRadius: 26,
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const { fetchDaySummary } = useFeed()
  const [summary, setSummary]   = useState<DaySummary | null>(null)
  const [loading, setLoading]   = useState(true)
  const router = useRouter()
  const today  = new Date()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchDaySummary(user.id, today).then((s) => {
      setSummary(s)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const initials = (() => {
    const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'U'
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  })()

  const dayLabel = (() => {
    const days  = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
    return `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`
  })()

  const calorieProgress = Math.min((summary?.caloriesConsumed ?? 0) / 600, 1)
  const workoutProgress = summary?.workoutDone ? 1 : 0
  const sleepProgress   = Math.min((summary?.sleepHours ?? 0) / 12, 1)

  const rings = [
    {
      progress: calorieProgress,
      color: '#FF2D55',
      gradientFrom: '#FF2D55',
      gradientTo: '#FF6482',
    },
    {
      progress: workoutProgress,
      color: '#A6FF00',
      gradientFrom: '#A6FF00',
      gradientTo: '#3BE000',
    },
    {
      progress: sleepProgress,
      color: '#00E5FF',
      gradientFrom: '#00E5FF',
      gradientTo: '#00B0FF',
    },
  ]

  const ringLabels = [
    { label: 'MOVIMENTO', color: '#FF6482', value: summary?.caloriesConsumed ?? 430, max: '600 kcal' },
    { label: 'EXERCÍCIO', color: '#A6FF00', value: workoutProgress > 0 ? 30 : 0, max: '30 min' },
    { label: 'DE PÉ',     color: '#00E5FF', value: summary?.sleepHours ? Math.round(summary.sleepHours) : 9, max: '12 h' },
  ]

  const gridCards = [
    {
      icon: Dumbbell,
      color: '#FF2D55',
      value: '0',
      sub: 'treinos · semana',
      href: '/workout',
    },
    {
      icon: Moon,
      color: '#7D7AFF',
      value: summary?.sleepHours ? `${summary.sleepHours.toFixed(1)}h` : '—',
      sub: summary?.sleepHours ? 'horas ontem' : 'sem registro',
      href: '/sleep',
    },
    {
      icon: Flame,
      color: '#FF9F0A',
      value: `${summary?.caloriesConsumed ?? 0}`,
      sub: 'de 2000 kcal',
      href: '/nutrition',
    },
    {
      icon: Footprints,
      color: '#30D158',
      value: '3.420',
      sub: 'passos hoje',
      href: null,
    },
  ]

  return (
    <div
      className="pb-32 min-h-screen"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingTop: 56,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 8,
        }}
      >
        <div>
          <h1 className="screen-title">Resumo</h1>
          <p className="label-today" style={{ marginTop: 6 }}>{dayLabel}</p>
        </div>
        <button
          onClick={() => router.push('/profile')}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(140deg,#7B5BFF,#33D6C6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            marginTop: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {initials}
        </button>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Rings card */}
        <div style={{ ...CARD_STYLE, padding: 22, display: 'flex', alignItems: 'center', gap: 22 }}>
          {loading ? (
            <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#1C1E23', flexShrink: 0 }} />
          ) : (
            <ActivityRing rings={rings} size={150} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ringLabels.map((r) => (
              <div key={r.label}>
                <div
                  className="section-label"
                  style={{ color: r.color }}
                >
                  {r.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>
                  {loading ? '—' : r.value}
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(235,235,245,0.5)' }}>
                    /{r.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {gridCards.map((card) => {
            const inner = (
              <div
                className="pressable"
                style={{ ...CARD_STYLE, padding: 18 }}
              >
                <card.icon size={24} color={card.color} />
                <div
                  className="metric-value"
                  style={{ color: '#fff', marginTop: 14, lineHeight: 1 }}
                >
                  {loading ? '—' : card.value}
                </div>
                <div
                  style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)', marginTop: 4 }}
                >
                  {card.sub}
                </div>
              </div>
            )

            if (card.href) {
              return (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  key={card.sub}
                  onClick={() => router.push(card.href!)}
                  style={{ cursor: 'pointer' }}
                >
                  {inner}
                </a>
              )
            }

            return <div key={card.sub}>{inner}</div>
          })}
        </div>

      </div>
    </div>
  )
}
