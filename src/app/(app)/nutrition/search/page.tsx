'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNutrition } from '@/hooks/useNutrition'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import type { FoodItem } from '@/types/app.types'
import type { Meal } from '@/types/database.types'

let debounceTimer: ReturnType<typeof setTimeout>

export default function NutritionSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealType = (searchParams.get('meal') ?? 'snack') as Meal['meal_type']
  const { user } = useAuth()
  const { searchResults, searching, searchFood, addMealItem } = useNutrition()

  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState('g')
  const [adding, setAdding] = useState(false)

  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => searchFood(val), 500)
  }, [searchFood])

  const preview = selectedFood
    ? {
        calories: Math.round((selectedFood.calories_per_100g * parseFloat(quantity || '0')) / 100),
        protein: ((selectedFood.protein_g * parseFloat(quantity || '0')) / 100).toFixed(1),
        carbs: ((selectedFood.carbs_g * parseFloat(quantity || '0')) / 100).toFixed(1),
        fat: ((selectedFood.fat_g * parseFloat(quantity || '0')) / 100).toFixed(1),
      }
    : null

  async function handleAdd() {
    if (!user || !selectedFood) return
    setAdding(true)
    await addMealItem(user.id, mealType, selectedFood, parseFloat(quantity), unit, new Date())
    setAdding(false)
    setSelectedFood(null)
    router.push('/nutrition')
  }

  return (
    <div className="pb-4">
      <Header title="Buscar Alimento" showBack backHref="/nutrition" />

      <div className="px-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar alimento..."
            className="w-full h-12 bg-surface border border-border rounded-xl pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {searching ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : searchResults.length === 0 && query ? (
          <div className="text-center py-10">
            <p className="text-text-muted">Nenhum resultado para "{query}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchResults.map((food, i) => (
              <button
                key={i}
                onClick={() => setSelectedFood(food)}
                className="w-full flex justify-between items-center p-4 bg-surface rounded-xl text-left hover:bg-surface-high transition-colors"
              >
                <div>
                  <p className="text-text-primary font-medium text-sm">{food.name}</p>
                  {food.brand && <p className="text-text-muted text-xs">{food.brand}</p>}
                </div>
                <span className="text-text-secondary text-sm shrink-0">
                  {Math.round(food.calories_per_100g)} kcal/100g
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedFood && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-1">{selectedFood.name}</h2>
            {selectedFood.brand && (
              <p className="text-text-muted text-sm mb-4">{selectedFood.brand}</p>
            )}
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 h-12 bg-bg border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-primary"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-12 bg-bg border border-border rounded-xl px-3 text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="unid">unid</option>
                <option value="colher">colher</option>
              </select>
            </div>
            {preview && (
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                {[
                  { label: 'kcal', value: preview.calories },
                  { label: 'Prot', value: `${preview.protein}g` },
                  { label: 'Carb', value: `${preview.carbs}g` },
                  { label: 'Gord', value: `${preview.fat}g` },
                ].map((s) => (
                  <div key={s.label} className="bg-bg rounded-xl p-2">
                    <p className="text-text-primary font-semibold text-sm">{s.value}</p>
                    <p className="text-text-muted text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setSelectedFood(null)}>
                Cancelar
              </Button>
              <Button fullWidth loading={adding} onClick={handleAdd}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
