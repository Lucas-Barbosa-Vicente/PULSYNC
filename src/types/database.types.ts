export interface PrivacySettings {
  feed: 'public' | 'friends' | 'private'
  stats: 'public' | 'friends' | 'private'
  challenges: 'public' | 'friends' | 'private'
}

export interface Profile {
  id: string
  display_name: string
  avatar_url?: string
  bio?: string
  timezone: string
  units: 'metric' | 'imperial'
  privacy_settings: PrivacySettings
  streak_freezes_remaining: number
  total_xp: number
  level: number
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED'
  created_at: string
}

export type HabitDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom'
  days?: HabitDay[]
  times_per_week?: number
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  icon: string
  color: string
  type: 'HABIT' | 'DAILY' | 'TODO'
  frequency: HabitFrequency
  target_value?: number
  target_unit?: string
  is_active: boolean
  order_index: number
  created_at: string
  archived_at?: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  value?: number
  notes?: string
  source: 'manual' | 'freeze'
}

export interface Streak {
  id: string
  user_id: string
  habit_id?: string
  current_count: number
  longest_count: number
  last_completed_date?: string
  freeze_used_at?: string
  updated_at: string
}

export interface RoutePoint {
  lat: number
  lng: number
  timestamp: string
}

export interface Workout {
  id: string
  user_id: string
  type: string
  title: string
  start_time: string
  end_time: string
  duration_seconds: number
  distance_meters?: number
  calories?: number
  avg_heart_rate?: number
  route_data?: RoutePoint[]
  source: 'manual' | 'gps'
  is_public: boolean
  is_pr?: boolean
  metadata?: Record<string, unknown>
}

export interface Meal {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  logged_at: string
  total_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  notes?: string
}

export interface MealItem {
  id: string
  meal_id: string
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  barcode?: string
  food_source: 'openfoodfacts' | 'usda' | 'manual'
}

export interface SleepSession {
  id: string
  user_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  quality_score: number
  deep_sleep_minutes: number
  light_sleep_minutes: number
  rem_minutes: number
  awake_minutes: number
  source: 'manual'
}

export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
  notes?: string
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
}

export interface StepLog {
  id: string
  user_id: string
  date: string        // "YYYY-MM-DD"
  steps: number
  logged_at: string
}

export interface Challenge {
  id: string
  creator_id: string
  title: string
  description: string
  type: 'steps' | 'workouts' | 'habits' | 'calories' | 'sleep' | 'custom'
  metric: string
  target_value: number
  unit: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  is_public: boolean
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  current_value: number
  rank: number
  joined_at: string
  completed_at?: string
}

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: 'streaks' | 'workouts' | 'nutrition' | 'sleep' | 'social' | 'challenges'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  condition: Record<string, unknown>
  xp_reward: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface ActivityFeed {
  id: string
  user_id: string
  type: 'workout' | 'habit_streak' | 'achievement' | 'challenge_joined' | 'challenge_won'
  reference_id?: string
  reference_type?: string
  visibility: 'public' | 'friends' | 'private'
  kudos_count: number
  created_at: string
}

export interface Kudos {
  id: string
  feed_item_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  feed_item_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data?: unknown
  is_read: boolean
  created_at: string
}
