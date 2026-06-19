'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Sunrise, Sun, Moon, Apple, Scale } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNutrition } from '@/hooks/useNutrition'
import CalorieRing from '@/components/nutrition/CalorieRing'
import MacroBar from '@/components/nutrition/MacroBar'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import type { Meal } from '@/types/database.types'

const CARD_STYLE = { background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)', borderRadius: 26 }
const TINT = 'var(--primary)'

const MEAL_CONFIG: Record<Meal['meal_type'], { label: string; Icon: React.ElementType }> = {
  breakfast: { label: 'Café da manhã', Icon: Sunrise },
  lunch:     { label: 'Almoço',        Icon: Sun     },
  dinner:    { label: 'Jantar',        Icon: Moon    },
  snack:     { label: 'Lanches',       Icon: Apple   },
}

export default function NutritionPage() {
  const { user } = useAuth()
  const { dayData, loading, fetchDayNutrition } = useNutrition()
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightInput, setWeightInput]         = useState('')
  const today = new Date()

  useEffect(() => {
    if (user) fetchDayNutrition(user.id, today)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const totals = dayData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const goals  = dayData?.goals  ?? { calories: 2000, protein: 150, carbs: 250, fat: 65 }

  const dayLabel = (() => {
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
    return `${today.getDate()} de ${months[today.getMonth()]}`
  })()

  return (
    <div className="pb-32 min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 56,
          paddingBottom: 4,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <h1 className="screen-title">Nutrição</h1>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(235,235,245,0.6)' }}>{dayLabel}</span>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Calorie ring + macros */}
        {loading ? (
          <Skeleton className="h-64 rounded-[26px]" />
        ) : (
          <div style={{ ...CARD_STYLE, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <CalorieRing consumed={totals.calories} goal={goals.calories} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MacroBar consumed={Math.round(totals.protein)} goal={goals.protein} type="protein" />
              <MacroBar consumed={Math.round(totals.carbs)}   goal={goals.carbs}   type="carb"    />
              <MacroBar consumed={Math.round(totals.fat)}     goal={goals.fat}     type="fat"     />
            </div>
          </div>
        )}

        {/* Meal list */}
        <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal['meal_type'][]).map((mealType, idx, arr) => {
            const cfg  = MEAL_CONFIG[mealType]
            const meal = dayData?.meals.find((m) => m.meal_type === mealType)
            const isLast = idx === arr.length - 1

            return (
              <div
                key={mealType}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <cfg.Icon size={20} color="rgba(235,235,245,0.5)" />
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{cfg.label}</p>
                    {meal && (
                      <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.4)', marginTop: 2 }}>
                        {meal.total_calories} kcal
                      </p>
                    )}
                  </div>
                </div>
                <Link href={`/nutrition/search?meal=${mealType}`}>
                  <Plus size={20} color={TINT} />
                </Link>
              </div>
            )
          })}

          {/* Weight row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderTop: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Scale size={20} color="rgba(235,235,245,0.5)" />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Peso</span>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: TINT,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Registrar
            </button>
          </div>
        </div>

      </div>

      {showWeightModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,11,13,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 50,
            padding: '0 20px',
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
              borderRadius: 26,
              padding: 24,
              width: '100%',
              maxWidth: 430,
              margin: '0 auto',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Registrar peso
            </h2>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="75.0 kg"
              style={{
                width: '100%',
                height: 48,
                background: '#23262C',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 13,
                paddingLeft: 16,
                paddingRight: 16,
                color: '#fff',
                fontSize: 16,
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowWeightModal(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowWeightModal(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: TINT,
                  color: '#001b08', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
