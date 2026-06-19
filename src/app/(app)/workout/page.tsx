'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Plus, Play } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkout } from '@/hooks/useWorkout'
import WorkoutCard from '@/components/workout/WorkoutCard'
import Button from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'

export default function WorkoutPage() {
  const { user } = useAuth()
  const { workouts, fetchWorkoutHistory } = useWorkout()
  const loading = false

  useEffect(() => {
    if (user) fetchWorkoutHistory(user.id)
  }, [user])

  return (
    <div className="pb-4">
      <Header
        title="Treinos"
        rightElement={
          <Link href="/workout/log" className="p-2 -mr-2 text-primary">
            <Plus size={22} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        <Link href="/workout/active">
          <Button fullWidth size="lg" icon={<Play size={20} />}>
            Iniciar Treino
          </Button>
        </Link>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-4xl mb-3">💪</span>
            <p className="text-text-secondary font-medium">Registre seu primeiro treino</p>
            <p className="text-text-muted text-sm mt-1">Comece agora ou registre manualmente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}
      </div>
    </div>
  )
}
