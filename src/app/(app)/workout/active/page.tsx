'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useWorkout } from '@/hooks/useWorkout'
import WorkoutTimer from '@/components/workout/WorkoutTimer'
import MetricDisplay from '@/components/workout/MetricDisplay'
import Button from '@/components/ui/Button'
import { WORKOUT_TYPES } from '@/constants/theme'
import { formatDistance, formatDuration } from '@/lib/utils'

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    isActive,
    isPaused,
    elapsedSeconds,
    distanceMeters,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
  } = useWorkout()

  const [selectedType, setSelectedType] = useState('run')
  const [started, setStarted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const startTimeRef = useRef<Date>(new Date())

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isActive && !isPaused) pauseWorkout()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isActive, isPaused, pauseWorkout])

  function handleStart() {
    startTimeRef.current = new Date()
    startWorkout(selectedType)
    setStarted(true)
  }

  async function handleFinish() {
    if (!user) return
    setShowConfirm(false)
    await finishWorkout(user.id, selectedType, startTimeRef.current)
    router.push('/workout')
  }

  const pace =
    distanceMeters > 0 && elapsedSeconds > 0
      ? `${((elapsedSeconds / 60) / (distanceMeters / 1000)).toFixed(1)} min/km`
      : '--'

  if (!started) {
    return (
      <div className="min-h-screen bg-bg flex flex-col px-4 pt-4 pb-8">
        <h1 className="text-lg font-bold text-text-primary mb-4">Tipo de treino</h1>
        <div className="grid grid-cols-3 gap-3 flex-1">
          {WORKOUT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface border-2 transition-all ${
                selectedType === t.id ? 'border-primary' : 'border-transparent'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs text-text-secondary">{t.name}</span>
            </button>
          ))}
        </div>
        <Button fullWidth size="lg" className="mt-6" onClick={handleStart}>
          Começar
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8 gap-8">
      <WorkoutTimer isActive={isActive} isPaused={isPaused} elapsedSeconds={elapsedSeconds} />

      <div className="grid grid-cols-2 gap-6 w-full">
        <MetricDisplay label="Distância" value={formatDistance(distanceMeters)} size="lg" />
        <MetricDisplay label="Pace" value={pace} size="lg" />
        <MetricDisplay label="Calorias" value={`${Math.round(elapsedSeconds / 60 * 5)}`} unit="kcal" size="lg" />
        <MetricDisplay label="BPM" value="--" size="lg" />
      </div>

      <div className="flex gap-4 w-full mt-auto">
        {isPaused ? (
          <Button
            fullWidth
            variant="accent"
            size="lg"
            onClick={() => resumeWorkout(selectedType)}
          >
            Retomar
          </Button>
        ) : (
          <Button fullWidth variant="accent" size="lg" onClick={pauseWorkout}>
            Pausar
          </Button>
        )}
        <Button fullWidth variant="danger" size="lg" onClick={() => setShowConfirm(true)}>
          Finalizar
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-2">Finalizar treino?</h2>
            <p className="text-text-secondary text-sm mb-4">
              Duração: {formatDuration(elapsedSeconds)} · {formatDistance(distanceMeters)}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>
                Continuar
              </Button>
              <Button variant="danger" fullWidth onClick={handleFinish}>
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
