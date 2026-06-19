'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNutrition } from '@/hooks/useNutrition'
import CalorieRing from '@/components/nutrition/CalorieRing'
import MacroBar from '@/components/nutrition/MacroBar'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Meal } from '@/types/database.types'

const MEAL_CONFIG: Record<Meal['meal_type'], { label: string; emoji: string }> = {
  breakfast: { label: 'Café da manhã', emoji: '☀️' },
  lunch: { label: 'Almoço', emoji: '🌤️' },
  dinner: { label: 'Jantar', emoji: '🌙' },
  snack: { label: 'Lanches', emoji: '🍎' },
}

export default function NutritionPage() {
  const { user } = useAuth()
  const { dayData, loading, fetchDayNutrition } = useNutrition()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const today = new Date()

  useEffect(() => {
    if (user) fetchDayNutrition(user.id, today)
  }, [user])

  function toggleSection(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const totals = dayData?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const goals = dayData?.goals ?? { calories: 2000, protein: 150, carbs: 250, fat: 65 }

  return (
    <div className="pb-4">
      <Header title="Nutrição" />

      <div className="px-4 space-y-4">
        <p className="text-text-muted text-sm">{formatDate(today, 'd MMMM')}</p>

        {loading ? (
          <Skeleton className="h-56 rounded-2xl" />
        ) : (
          <div className="bg-surface rounded-2xl p-5 flex flex-col items-center gap-4">
            <CalorieRing consumed={totals.calories} goal={goals.calories} />
            <div className="w-full space-y-3">
              <MacroBar consumed={Math.round(totals.protein)} goal={goals.protein} type="protein" />
              <MacroBar consumed={Math.round(totals.carbs)} goal={goals.carbs} type="carb" />
              <MacroBar consumed={Math.round(totals.fat)} goal={goals.fat} type="fat" />
            </div>
          </div>
        )}

        {/* Meal sections */}
        {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal['meal_type'][]).map((mealType) => {
          const cfg = MEAL_CONFIG[mealType]
          const meal = dayData?.meals.find((m) => m.meal_type === mealType)
          const isOpen = expanded[mealType]

          return (
            <div key={mealType} className="bg-surface rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(mealType)}
                className="flex items-center justify-between w-full p-4"
              >
                <div className="flex items-center gap-2">
                  <span>{cfg.emoji}</span>
                  <span className="font-medium text-text-primary">{cfg.label}</span>
                  {meal && (
                    <span className="text-xs text-text-muted">{meal.total_calories} kcal</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/nutrition/search?meal=${mealType}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary"
                  >
                    <Plus size={18} />
                  </Link>
                  {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </div>
              </button>

              {isOpen && meal && (
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                  {meal.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-primary">{item.food_name}</span>
                      <span className="text-text-muted">{item.calories} kcal</span>
                    </div>
                  ))}
                  {meal.items.length === 0 && (
                    <p className="text-text-muted text-sm">Nenhum item ainda.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Weight */}
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <p className="font-medium text-text-primary">⚖️ Peso</p>
            <button
              onClick={() => setShowWeightModal(true)}
              className="text-primary text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Registrar
            </button>
          </div>
        </div>
      </div>

      {showWeightModal && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-4">Registrar peso</h2>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="75.0 kg"
              className="w-full h-12 bg-bg border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowWeightModal(false)}>
                Cancelar
              </Button>
              <Button fullWidth onClick={() => setShowWeightModal(false)}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
