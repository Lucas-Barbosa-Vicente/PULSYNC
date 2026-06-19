'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Meal, MealItem } from '@/types/database.types'
import type { FoodItem } from '@/types/app.types'

interface DayNutrition {
  meals: (Meal & { items: MealItem[] })[]
  totals: { calories: number; protein: number; carbs: number; fat: number }
  goals: { calories: number; protein: number; carbs: number; fat: number }
}

export function useNutrition() {
  const supabase = createClient()
  const [dayData, setDayData] = useState<DayNutrition | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [searching, setSearching] = useState(false)

  const fetchDayNutrition = useCallback(
    async (userId: string, date: Date) => {
      setLoading(true)
      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const { data: meals } = await supabase
          .from('meals')
          .select('*, items:meal_items(*)')
          .eq('user_id', userId)
          .gte('logged_at', `${dateStr}T00:00:00`)
          .lte('logged_at', `${dateStr}T23:59:59`)
          .order('logged_at')

        const mealsData = (meals ?? []) as (Meal & { items: MealItem[] })[]
        const totals = mealsData.reduce(
          (acc, m) => ({
            calories: acc.calories + m.total_calories,
            protein: acc.protein + m.protein_g,
            carbs: acc.carbs + m.carbs_g,
            fat: acc.fat + m.fat_g,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        setDayData({
          meals: mealsData,
          totals,
          goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
        })
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const searchFood = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const cacheKey = `food_${query}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      setSearchResults(JSON.parse(cached))
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&fields=product_name,nutriments,brands&page_size=20`
      )
      const json = await res.json()
      const items: FoodItem[] = (json.products ?? [])
        .filter((p: Record<string, unknown>) => p.product_name)
        .map(
          (p: {
            product_name: string
            brands?: string
            nutriments?: Record<string, number>
          }) => ({
            name: p.product_name,
            brand: p.brands,
            calories_per_100g: p.nutriments?.['energy-kcal_100g'] ?? 0,
            protein_g: p.nutriments?.['proteins_100g'] ?? 0,
            carbs_g: p.nutriments?.['carbohydrates_100g'] ?? 0,
            fat_g: p.nutriments?.['fat_100g'] ?? 0,
          })
        )
      sessionStorage.setItem(cacheKey, JSON.stringify(items))
      setSearchResults(items)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const addMealItem = useCallback(
    async (
      userId: string,
      mealType: Meal['meal_type'],
      food: FoodItem,
      qty: number,
      unit: string,
      date: Date
    ) => {
      const ratio = qty / 100
      const calories = Math.round(food.calories_per_100g * ratio)
      const protein = parseFloat((food.protein_g * ratio).toFixed(1))
      const carbs = parseFloat((food.carbs_g * ratio).toFixed(1))
      const fat = parseFloat((food.fat_g * ratio).toFixed(1))

      const dateStr = format(date, 'yyyy-MM-dd')
      const { data: existing } = await supabase
        .from('meals')
        .select('id, total_calories, protein_g, carbs_g, fat_g')
        .eq('user_id', userId)
        .eq('meal_type', mealType)
        .gte('logged_at', `${dateStr}T00:00:00`)
        .lte('logged_at', `${dateStr}T23:59:59`)
        .single()

      let mealId: string
      if (existing) {
        mealId = existing.id
        await supabase
          .from('meals')
          .update({
            total_calories: existing.total_calories + calories,
            protein_g: existing.protein_g + protein,
            carbs_g: existing.carbs_g + carbs,
            fat_g: existing.fat_g + fat,
          })
          .eq('id', mealId)
      } else {
        const { data: newMeal } = await supabase
          .from('meals')
          .insert({
            user_id: userId,
            meal_type: mealType,
            logged_at: new Date().toISOString(),
            total_calories: calories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
          })
          .select()
          .single()
        mealId = newMeal!.id
      }

      await supabase.from('meal_items').insert({
        meal_id: mealId,
        food_name: food.name,
        quantity: qty,
        unit,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        food_source: 'openfoodfacts',
      })

      return true
    },
    [supabase]
  )

  const logWeight = useCallback(
    async (userId: string, weight_kg: number) => {
      await supabase.from('weight_logs').insert({
        user_id: userId,
        weight_kg,
        logged_at: new Date().toISOString(),
      })
    },
    [supabase]
  )

  return { dayData, loading, searchResults, searching, fetchDayNutrition, searchFood, addMealItem, logWeight }
}
