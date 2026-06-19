import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday as dfIsToday, isYesterday as dfIsYesterday, startOfDay as dfStartOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

export function formatCalories(cal: number): string {
  return `${cal.toLocaleString('pt-BR')} kcal`
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const
export function getDayOfWeek(date: Date | string): string {
  return DAYS[new Date(date).getDay()]
}

export function isToday(date: Date | string): boolean {
  return dfIsToday(new Date(date))
}

export function isYesterday(date: Date | string): boolean {
  return dfIsYesterday(new Date(date))
}

export function startOfDay(date: Date | string): Date {
  return dfStartOfDay(new Date(date))
}

export function formatDate(date: Date | string, fmt: string): string {
  return format(new Date(date), fmt, { locale: ptBR })
}
