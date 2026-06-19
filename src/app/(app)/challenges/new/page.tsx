'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges } from '@/hooks/useChallenges'
import Button from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import type { Challenge } from '@/types/database.types'

const CHALLENGE_TYPES: { id: Challenge['type']; label: string; icon: string; unit: string; metric: string }[] = [
  { id: 'workouts', label: 'Treinos', icon: '🏋️', unit: 'treinos', metric: 'workout_count' },
  { id: 'steps', label: 'Passos', icon: '👣', unit: 'passos', metric: 'step_count' },
  { id: 'habits', label: 'Hábitos', icon: '✅', unit: 'hábitos', metric: 'habit_completions' },
  { id: 'calories', label: 'Calorias', icon: '🔥', unit: 'kcal', metric: 'calories_burned' },
  { id: 'sleep', label: 'Sono', icon: '😴', unit: 'horas', metric: 'sleep_hours' },
  { id: 'custom', label: 'Personalizado', icon: '🎯', unit: 'pontos', metric: 'custom' },
]

const DURATIONS = [3, 7, 14, 30]

export default function NewChallengePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createChallenge } = useChallenges()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<Challenge['type']>('workouts')
  const [target, setTarget] = useState('10')
  const [duration, setDuration] = useState(7)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  const selectedType = CHALLENGE_TYPES.find((t) => t.id === type)!

  async function handleCreate() {
    if (!user || !title.trim()) return
    setLoading(true)
    try {
      const start = new Date()
      const end = addDays(start, duration)
      const { inviteUrl } = await createChallenge(user.id, {
        title,
        description,
        type,
        metric: selectedType.metric,
        target_value: parseInt(target) || 10,
        unit: selectedType.unit,
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
        is_public: isPublic,
      })

      if (navigator.share) {
        await navigator.share({ title: `Desafio: ${title}`, url: inviteUrl }).catch(() => {})
      } else {
        await navigator.clipboard.writeText(inviteUrl)
        toast.success('Link copiado!')
      }

      router.push('/challenges')
    } catch {
      toast.error('Erro ao criar desafio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-28">
      <Header title="Novo Desafio" showBack backHref="/challenges" />

      <div className="px-4 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Nome do desafio</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quem treina mais esta semana?"
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {CHALLENGE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border-2 transition-all ${
                  type === t.id ? 'border-primary' : 'border-transparent'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs text-text-secondary">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Meta ({selectedType.unit})
          </label>
          <input
            type="number"
            min={1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Duração</label>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-all ${
                  duration === d
                    ? 'bg-primary text-bg border-primary'
                    : 'bg-surface border-border text-text-secondary'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-text-secondary">Visível para amigos</label>
          <button
            onClick={() => setIsPublic((v) => !v)}
            className={`w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-surface-high'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                isPublic ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-bg border-t border-border max-w-[430px] mx-auto safe-bottom">
        <Button fullWidth loading={loading} onClick={handleCreate}>
          Criar e Convidar
        </Button>
      </div>
    </div>
  )
}
