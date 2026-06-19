'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Dumbbell, Footprints, CheckCircle, Flame, Moon, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges } from '@/hooks/useChallenges'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import type { Challenge } from '@/types/database.types'

const TINT = 'var(--primary)'
const TINT_DIM = 'rgba(51,214,198,0.16)'
const CARD_STYLE = { background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)', borderRadius: 26 }

const CHALLENGE_TYPES: { id: Challenge['type']; label: string; Icon: React.ElementType; color: string; unit: string; metric: string }[] = [
  { id: 'workouts',  label: 'Treinos',       Icon: Dumbbell,     color: '#FF2D55', unit: 'treinos',  metric: 'workout_count'     },
  { id: 'steps',     label: 'Passos',        Icon: Footprints,   color: '#30D158', unit: 'passos',   metric: 'step_count'        },
  { id: 'habits',    label: 'Hábitos',       Icon: CheckCircle,  color: '#33D6C6', unit: 'hábitos',  metric: 'habit_completions' },
  { id: 'calories',  label: 'Calorias',      Icon: Flame,        color: '#FF9F0A', unit: 'kcal',     metric: 'calories_burned'   },
  { id: 'sleep',     label: 'Sono',          Icon: Moon,         color: '#7D7AFF', unit: 'horas',    metric: 'sleep_hours'       },
  { id: 'custom',    label: 'Personalizado', Icon: Target,       color: '#A6FF00', unit: 'pontos',   metric: 'custom'            },
]

const DURATIONS = ['3d', '7d', '14d', '30d']
const DURATION_DAYS: Record<string, number> = { '3d': 3, '7d': 7, '14d': 14, '30d': 30 }

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 48,
  background: '#23262C',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 13,
  paddingLeft: 16,
  paddingRight: 16,
  color: '#fff',
  fontSize: 16,
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: 'rgba(235,235,245,0.4)',
  marginBottom: 10,
}

export default function NewChallengePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createChallenge } = useChallenges()

  const [title, setTitle]     = useState('')
  const [type, setType]       = useState<Challenge['type']>('workouts')
  const [target, setTarget]   = useState('10')
  const [dur, setDur]         = useState('7d')
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(false)

  const selectedType = CHALLENGE_TYPES.find((t) => t.id === type)!

  async function handleCreate() {
    if (!user || !title.trim()) return
    setLoading(true)
    try {
      const start = new Date()
      const end   = addDays(start, DURATION_DAYS[dur])
      const { inviteUrl } = await createChallenge(user.id, {
        title,
        description: '',
        type,
        metric: selectedType.metric,
        target_value: parseInt(target) || 10,
        unit: selectedType.unit,
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd'),
        is_public: visible,
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
    <div className="pb-32 min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 56,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: TINT }}
        >
          <ChevronLeft size={28} color={TINT} />
        </button>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.4, color: '#fff' }}>Novo Desafio</h1>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Nome */}
        <div>
          <p style={LABEL_STYLE}>Nome do Desafio</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quem treina mais esta semana?"
            style={INPUT_STYLE}
          />
        </div>

        {/* Tipo */}
        <div>
          <p style={LABEL_STYLE}>Tipo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {CHALLENGE_TYPES.map(({ id, label, Icon, color }) => {
              const isSelected = type === id
              return (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '14px 8px',
                    borderRadius: 16,
                    background: '#23262C',
                    border: `2.5px solid ${isSelected ? TINT : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'border-color 150ms',
                  }}
                >
                  <Icon size={24} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(235,235,245,0.6)' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Meta */}
        <div>
          <p style={LABEL_STYLE}>Meta</p>
          <input
            type="number"
            min={1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={INPUT_STYLE}
          />
        </div>

        {/* Duração */}
        <div>
          <p style={LABEL_STYLE}>Duração</p>
          <div style={{ display: 'flex', gap: 8, background: '#23262C', borderRadius: 13, padding: 4 }}>
            {DURATIONS.map((d) => {
              const isSelected = dur === d
              return (
                <button
                  key={d}
                  onClick={() => setDur(d)}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    background: isSelected ? TINT : 'transparent',
                    color: isSelected ? '#001b08' : 'rgba(235,235,245,0.6)',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 150ms, color 150ms',
                    fontFamily: 'inherit',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        {/* Visível */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Visível para amigos</span>
          <button
            onClick={() => setVisible((v) => !v)}
            style={{
              width: 51,
              height: 31,
              borderRadius: 100,
              background: visible ? TINT : '#23262C',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 200ms',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 27,
                height: 27,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: visible ? 22 : 2,
                transition: 'left 200ms',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 16,
            background: loading || !title.trim() ? 'rgba(51,214,198,0.3)' : TINT,
            color: '#001b08',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Criando...' : 'Criar desafio'}
        </button>

      </div>
    </div>
  )
}
