'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import Button from '@/components/ui/Button'
import Header from '@/components/layout/Header'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { updateProfile } = useProfile()

  const [name, setName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [units, setUnits] = useState<'metric' | 'imperial'>(profile?.units ?? 'metric')
  const [calories, setCalories] = useState('2000')
  const [sleepGoal, setSleepGoal] = useState(8)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!user) return
    setLoading(true)
    try {
      await updateProfile(user.id, { display_name: name, bio })
      toast.success('Perfil atualizado!')
      router.push('/profile')
    } catch {
      toast.error('Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-12 bg-surface border border-border rounded-xl px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors'

  return (
    <div className="pb-28">
      <Header title="Configurações" showBack backHref="/profile" />

      <div className="px-4 space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Nome completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Bio <span className="text-text-muted">({bio.length}/150)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Conte um pouco sobre você..."
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">Unidades</label>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-all ${
                  units === u ? 'bg-primary text-bg border-primary' : 'bg-surface border-border text-text-secondary'
                }`}
              >
                {u === 'metric' ? 'Métrico' : 'Imperial'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Meta de calorias</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Meta de sono: <span className="text-text-primary font-semibold">{sleepGoal}h</span>
          </label>
          <input
            type="range"
            min={5}
            max={10}
            value={sleepGoal}
            onChange={(e) => setSleepGoal(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>5h</span>
            <span>10h</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-bg border-t border-border max-w-[430px] mx-auto safe-bottom">
        <Button fullWidth loading={loading} onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </div>
  )
}
