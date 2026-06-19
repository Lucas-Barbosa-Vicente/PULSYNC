export const COLORS = {
  bg: '#000000',
  surface: '#1C1C1E',
  surfaceHigh: '#2C2C2E',
  surfaceCard: '#141414',
  primary: '#00D4AA',
  accent: '#FF6B35',
  social: '#A855F7',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#48484A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  border: '#38383A',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E8E8F0',
} as const

export const METRIC_COLORS = {
  move   : '#FF375F',
  steps  : '#AF52DE',
  dist   : '#30D158',
  sleep  : '#0A84FF',
  heart  : '#FF6961',
  water  : '#32ADE6',
  workout: '#FF6B35',
} as const

export const TIER_COLORS = {
  bronze  : '#CD7F32',
  silver  : '#C0C0C0',
  gold    : '#FFD700',
  platinum: '#E8E8F0',
} as const

export const WORKOUT_TYPES = [
  { id: 'run',      name: 'Corrida',    icon: '🏃', metValue: 9.8,  color: '#00D4AA' },
  { id: 'walk',     name: 'Caminhada',  icon: '🚶', metValue: 3.5,  color: '#30D158' },
  { id: 'bike',     name: 'Ciclismo',   icon: '🚴', metValue: 8.0,  color: '#FF9F0A' },
  { id: 'swim',     name: 'Natação',    icon: '🏊', metValue: 8.3,  color: '#0A84FF' },
  { id: 'strength', name: 'Musculação', icon: '🏋️', metValue: 5.0,  color: '#AF52DE' },
  { id: 'hiit',     name: 'HIIT',       icon: '⚡', metValue: 10.3, color: '#FF6B35' },
  { id: 'yoga',     name: 'Yoga',       icon: '🧘', metValue: 2.5,  color: '#FF375F' },
  { id: 'pilates',  name: 'Pilates',    icon: '🤸', metValue: 3.0,  color: '#AF52DE' },
  { id: 'football', name: 'Futebol',    icon: '⚽', metValue: 7.0,  color: '#30D158' },
  { id: 'tennis',   name: 'Tênis',      icon: '🎾', metValue: 7.3,  color: '#FF9F0A' },
  { id: 'other',    name: 'Outro',      icon: '💪', metValue: 5.0,  color: '#8E8E93' },
] as const
