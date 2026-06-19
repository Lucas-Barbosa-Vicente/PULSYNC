'use client'

import { useEffect } from 'react'
import { Plus, Dumbbell, Play } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkout } from '@/hooks/useWorkout'
import WorkoutCard from '@/components/workout/WorkoutCard'
import Skeleton from '@/components/ui/Skeleton'

const CARD_STYLE = {
  background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
  borderRadius: 26,
}

export default function WorkoutPage() {
  const { user } = useAuth()
  const { workouts, fetchWorkoutHistory } = useWorkout()
  const loading = false

  useEffect(() => {
    if (user) fetchWorkoutHistory(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="pb-32 min-h-screen" style={{ background: 'var(--bg)' }}>
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
        <h1 className="screen-title">Treinos</h1>
        <div
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
        </div>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Iniciar Treino button */}
        <button
          style={{
            width: '100%',
            height: 52,
            borderRadius: 16,
            background: 'var(--primary)',
            color: '#001b08',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'inherit',
          }}
        >
          <Play size={18} fill="#001b08" color="#001b08" />
          Iniciar Treino
        </button>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[26px]" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
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
                background: 'rgba(255,45,85,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Dumbbell size={32} color="#FF2D55" />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
              Registre seu primeiro treino
            </p>
            <p style={{ fontSize: 15, color: 'rgba(235,235,245,0.4)' }}>
              Comece agora ou registre manualmente.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workouts.map((w) => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}

      </div>
    </div>
  )
}
