'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Sprout } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import HabitCard from '@/components/habits/HabitCard'
import Skeleton from '@/components/ui/Skeleton'

const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const CARD_STYLE  = { background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)', borderRadius: 26 }

export default function HabitsPage() {
  const { user } = useAuth()
  const { habits, loading, completedCount, fetchTodayHabits, completeHabit, undoComplete, archiveHabit } =
    useHabits()

  const today = new Date().getDay()

  useEffect(() => {
    if (user) fetchTodayHabits(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div
      className="pb-32 min-h-screen"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 56,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 8,
        }}
      >
        <h1 className="screen-title">Hábitos</h1>
        <Link
          href="/habits/new"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(51,214,198,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={20} color="var(--primary)" strokeWidth={2.5} />
        </Link>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Progress card */}
        {loading ? (
          <Skeleton className="h-28 rounded-[26px]" />
        ) : (
          <div style={{ ...CARD_STYLE, padding: 18 }}>
            {/* Pill badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(51,214,198,0.12)',
                borderRadius: 100,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                {completedCount} de {habits.length} concluídos hoje
              </span>
            </div>

            {/* Week strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {WEEK_LABELS.map((label, i) => {
                const isPast   = i < today
                const isToday  = i === today
                const isFuture = i > today

                let circleStyle: React.CSSProperties = {
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }

                if (isToday) {
                  circleStyle = {
                    ...circleStyle,
                    border: '2.5px solid var(--primary)',
                    background: 'transparent',
                    color: 'var(--primary)',
                  }
                } else if (isPast) {
                  circleStyle = {
                    ...circleStyle,
                    background: 'rgba(255,69,58,0.28)',
                    color: 'rgba(255,69,58,0.8)',
                  }
                } else {
                  circleStyle = {
                    ...circleStyle,
                    background: '#23262C',
                    color: 'rgba(235,235,245,0.3)',
                  }
                }

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={circleStyle}>
                      {isToday ? label.slice(0, 1) : ''}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(235,235,245,0.4)' }}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Habits list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-[26px]" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 64,
              paddingBottom: 64,
              gap: 12,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(48,209,88,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Sprout size={32} color="#30D158" />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
              Crie seu primeiro hábito
            </p>
            <p style={{ fontSize: 15, color: 'rgba(235,235,245,0.4)' }}>
              Pequenos passos constroem grandes mudanças.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <HabitCard
                    habit={habit}
                    onComplete={() => user && completeHabit(habit.id, user.id)}
                    onUndo={() => user && undoComplete(habit.id, user.id)}
                    onArchive={() => archiveHabit(habit.id)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
