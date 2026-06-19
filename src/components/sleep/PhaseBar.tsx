import type { SleepSession } from '@/types/database.types'

interface PhaseBarProps {
  session: SleepSession
}

export default function PhaseBar({ session }: PhaseBarProps) {
  const total = session.duration_minutes || 1
  const phases = [
    { label: 'Profundo', minutes: session.deep_sleep_minutes, color: '#6366F1' },
    { label: 'Leve', minutes: session.light_sleep_minutes, color: '#A5B4FC' },
    { label: 'REM', minutes: session.rem_minutes, color: 'var(--primary)' },
    { label: 'Acordado', minutes: session.awake_minutes, color: 'var(--error)' },
  ]

  function fmt(min: number) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h ${m}min` : `${m}min`
  }

  return (
    <div className="space-y-3">
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {phases.map((p) => (
          <div
            key={p.label}
            style={{ width: `${(p.minutes / total) * 100}%`, backgroundColor: p.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {phases.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-text-secondary">
              {p.label} · {fmt(p.minutes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
