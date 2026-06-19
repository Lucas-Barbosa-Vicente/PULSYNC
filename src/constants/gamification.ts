export const XP_REWARDS = {
  habit_complete: 10,
  habit_streak_7: 50,
  habit_streak_30: 200,
  habit_streak_100: 500,
  workout_log: 30,
  workout_pr: 100,
  meal_log: 15,
  sleep_log: 20,
  challenge_join: 25,
  challenge_win: 150,
  kudos_received: 5,
  achievement_bronze: 50,
  achievement_silver: 150,
  achievement_gold: 300,
  achievement_platinum: 500,
} as const

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500]

function getThreshold(level: number): number {
  if (level < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level]
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * 2500
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xp >= getThreshold(level)) level++
  return level - 1
}

export function xpForLevel(level: number): number {
  return getThreshold(level)
}

export function xpToNextLevel(xp: number): number {
  const currentLevel = levelFromXp(xp)
  return getThreshold(currentLevel + 1) - xp
}

export function progressToNextLevel(xp: number): number {
  const currentLevel = levelFromXp(xp)
  const currentThreshold = getThreshold(currentLevel)
  const nextThreshold = getThreshold(currentLevel + 1)
  return (xp - currentThreshold) / (nextThreshold - currentThreshold)
}

export function levelTitle(level: number): string {
  if (level <= 5) return 'Iniciante'
  if (level <= 10) return 'Ativo'
  if (level <= 20) return 'Dedicado'
  if (level <= 40) return 'Atleta'
  return 'Elite'
}
