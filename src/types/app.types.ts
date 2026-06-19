import type { Habit, HabitLog, Streak, SleepSession } from './database.types'

export type StreakStatus = 'active' | 'at-risk' | 'broken'

export interface HabitWithStreak extends Habit {
  streak: Streak | null
  streakStatus: StreakStatus
  completedToday: boolean
  todayLog?: HabitLog
}

export interface FoodItem {
  name: string
  brand?: string
  calories_per_100g: number
  protein_g: number
  carbs_g: number
  fat_g: number
  barcode?: string
}

export type SleepQuality = 'excellent' | 'good' | 'regular' | 'poor'

export interface SleepWithScore extends SleepSession {
  quality: SleepQuality
  qualityLabel: string
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  avatarUrl?: string
  totalXp: number
  level: number
  position: number
}

export interface DaySummary {
  workoutDone: boolean
  habitsCompleted: number
  habitsTotal: number
  caloriesConsumed: number
  caloriesGoal: number
  sleepHours: number
  sleepGoal: number
  overallProgress: number
}
