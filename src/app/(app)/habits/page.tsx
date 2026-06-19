'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import HabitCard from '@/components/habits/HabitCard'
import WeekProgress from '@/components/habits/WeekProgress'
import ProgressBar from '@/components/ui/ProgressBar'
import Skeleton from '@/components/ui/Skeleton'
import Header from '@/components/layout/Header'

export default function HabitsPage() {
  const { user } = useAuth()
  const { habits, loading, completedCount, fetchTodayHabits, completeHabit, undoComplete, archiveHabit } =
    useHabits()

  const today = new Date().getDay()
  const weekDaysDefault = Array(7).fill(false)

  useEffect(() => {
    if (user) fetchTodayHabits(user.id)
  }, [user])

  const progress = habits.length > 0 ? completedCount / habits.length : 0

  return (
    <div className="pb-4">
      <Header
        title="Hábitos"
        rightElement={
          <Link href="/habits/new" className="p-2 -mr-2 text-primary">
            <Plus size={22} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Summary */}
        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : (
          <div className="bg-surface rounded-2xl p-4 space-y-3">
            <p className="text-sm text-text-secondary">
              <span className="text-text-primary font-semibold">{completedCount}</span> de{' '}
              <span className="text-text-primary font-semibold">{habits.length}</span> concluídos hoje
            </p>
            <ProgressBar progress={progress} />
            <WeekProgress weekDays={weekDaysDefault} today={today} />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-4xl mb-3">🌱</span>
            <p className="text-text-secondary font-medium">Crie seu primeiro hábito</p>
            <p className="text-text-muted text-sm mt-1">
              Pequenos passos constroem grandes mudanças.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
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
