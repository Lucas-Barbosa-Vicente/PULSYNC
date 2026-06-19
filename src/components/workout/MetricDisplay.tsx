import { cn } from '@/lib/utils'

type DisplaySize = 'sm' | 'md' | 'lg'

interface MetricDisplayProps {
  label: string
  value: string
  unit?: string
  size?: DisplaySize
}

const valueSize: Record<DisplaySize, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export default function MetricDisplay({ label, value, unit, size = 'md' }: MetricDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={cn('font-mono font-black text-text-primary', valueSize[size])}>
          {value}
        </span>
        {unit && <span className="text-sm text-text-secondary mb-1">{unit}</span>}
      </div>
    </div>
  )
}
