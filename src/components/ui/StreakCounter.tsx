import { cn } from '@/lib/utils'
import type { StreakStatus } from '@/types/app.types'

interface StreakCounterProps {
  count: number
  status: StreakStatus
  className?: string
}

const statusColor: Record<StreakStatus, string> = {
  active: 'text-success',
  'at-risk': 'text-accent',
  broken: 'text-error',
}

export default function StreakCounter({ count, status, className }: StreakCounterProps) {
  return (
    <div className={cn('flex items-center gap-1', statusColor[status], className)}>
      <span>🔥</span>
      <span className="font-bold font-mono text-sm">{count}</span>
      <span className="text-xs opacity-80">dias</span>
    </div>
  )
}
