'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import { WORKOUT_TYPES } from '@/constants/theme'
import { toast } from 'sonner'

export default function LogWorkoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [type, setType] = useState('run')
  const [datetime, setDatetime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [distance, setDistance] = useState('')
  const [distUnit, setDistUnit] = useState<'km' | 'm'>('km')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!user) return
    setLoading(true)
    try {
      const durationSeconds = hours * 3600 + minutes * 60
      const distanceMeters = distance
        ? distUnit === 'km'
          ? parseFloat(distance) * 1000
          : parseFloat(distance)
        : 0
      const startTime = new Date(datetime)
      const endTime = new Date(startTime.getTime() + durationSeconds * 1000)
      const wt = WORKOUT_TYPES.find((t) => t.id === type)

      await supabase.from('workouts').insert({
        user_id: user.id,
        type,
        title: wt?.name ?? type,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        distance_meters: Math.round(distanceMeters),
        calories: calories ? parseInt(calories) : null,
        source: 'manual',
        is_public: true,
      })

      toast.success('Treino registrado!')
      router.push('/workout')
    } catch {
      toast.error('Erro ao salvar treino. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors'

  return (
    <div className="pb-28">
      <Header title="Registrar Treino" showBack backHref="/workout" />

      <div className="px-4 space-y-5">
        {/* Type */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {WORKOUT_TYPES.slice(0, 9).map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border-2 transition-all ${
                  type === t.id ? 'border-primary' : 'border-transparent'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-[10px] text-text-secondary">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Data e hora</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Duração</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                placeholder="HH"
                className={inputClass}
              />
              <p className="text-xs text-text-muted text-center mt-1">horas</p>
            </div>
            <div className="flex-1">
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                placeholder="MM"
                className={inputClass}
              />
              <p className="text-xs text-text-muted text-center mt-1">minutos</p>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Distância (opcional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0"
              className={`${inputClass} flex-1`}
            />
            <select
              value={distUnit}
              onChange={(e) => setDistUnit(e.target.value as 'km' | 'm')}
              className="h-12 bg-surface border border-border rounded-xl px-3 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="km">km</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>

        {/* Calories */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Calorias (opcional)</label>
          <input
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0 kcal"
            className={inputClass}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Como foi o treino?"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-bg border-t border-border max-w-[430px] mx-auto safe-bottom">
        <Button fullWidth loading={loading} onClick={handleSave}>
          Salvar Treino
        </Button>
      </div>
    </div>
  )
}
