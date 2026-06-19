'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useHabits } from '@/hooks/useHabits'
import Button from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import type { Habit } from '@/types/database.types'

const ICONS = ['💧', '🧘', '🏋️', '📚', '😴', '🚫', '🏃', '🥗', '🎯', '💊', '🧹', '✍️', '🎸', '🌿', '🧗', '🚴', '🏊', '🤸']
const COLORS = ['#00D4AA', '#FF6B35', '#A855F7', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(40),
})

type FormData = z.infer<typeof schema>

type HabitType = 'HABIT' | 'DAILY' | 'TODO'
type FreqType = 'daily' | 'weekly' | 'custom'

export default function NewHabitPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createHabit } = useHabits()

  const [icon, setIcon] = useState('💧')
  const [color, setColor] = useState(COLORS[0])
  const [type, setType] = useState<HabitType>('HABIT')
  const [freqType, setFreqType] = useState<FreqType>('daily')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [timesPerWeek, setTimesPerWeek] = useState(3)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const nameValue = watch('name', '')

  function toggleDay(code: string) {
    setSelectedDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    )
  }

  async function onSubmit(data: FormData) {
    if (!user) return
    const frequency: Habit['frequency'] =
      freqType === 'daily'
        ? { type: 'daily' }
        : freqType === 'weekly'
        ? { type: 'custom', days: selectedDays as Habit['frequency']['days'] }
        : { type: 'weekly', times_per_week: timesPerWeek }

    await createHabit(user.id, {
      name: data.name,
      icon,
      color,
      type,
      frequency,
    })
    router.push('/habits')
  }

  return (
    <div className="pb-28">
      <Header title="Novo Hábito" showBack backHref="/habits" />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Nome <span className="text-text-muted">({nameValue.length}/40)</span>
          </label>
          <input
            {...register('name')}
            maxLength={40}
            placeholder="Ex: Beber água"
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Tipo</label>
          <div className="flex gap-2">
            {(['HABIT', 'DAILY', 'TODO'] as HabitType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-all ${
                  type === t
                    ? 'bg-primary text-bg border-primary'
                    : 'bg-surface border-border text-text-secondary'
                }`}
              >
                {t === 'HABIT' ? 'Hábito' : t === 'DAILY' ? 'Rotina' : 'Tarefa'}
              </button>
            ))}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Ícone</label>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`h-11 rounded-xl flex items-center justify-center text-xl bg-surface transition-all ${
                  icon === ic ? 'ring-2 ring-primary' : ''
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Cor</label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-bg' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Frequency (only for DAILY) */}
        {type === 'DAILY' && (
          <div>
            <label className="block text-sm text-text-secondary mb-2">Frequência</label>
            <div className="flex gap-2 mb-3">
              {(['daily', 'weekly', 'custom'] as FreqType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFreqType(f)}
                  className={`flex-1 h-9 rounded-xl text-xs font-medium border transition-all ${
                    freqType === f
                      ? 'bg-primary text-bg border-primary'
                      : 'bg-surface border-border text-text-secondary'
                  }`}
                >
                  {f === 'daily' ? 'Diário' : f === 'weekly' ? 'Dias' : 'X por semana'}
                </button>
              ))}
            </div>

            {freqType === 'weekly' && (
              <div className="flex gap-2">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(DAY_CODES[i])}
                    className={`flex-1 h-9 rounded-lg text-xs font-medium border transition-all ${
                      selectedDays.includes(DAY_CODES[i])
                        ? 'bg-primary text-bg border-primary'
                        : 'bg-surface border-border text-text-secondary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {freqType === 'custom' && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary">Vezes por semana:</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={timesPerWeek}
                  onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                  className="w-16 h-10 bg-surface border border-border rounded-xl text-center text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        )}
      </form>

      {/* Fixed save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-bg border-t border-border max-w-[430px] mx-auto safe-bottom">
        <Button fullWidth loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
          Salvar Hábito
        </Button>
      </div>
    </div>
  )
}
