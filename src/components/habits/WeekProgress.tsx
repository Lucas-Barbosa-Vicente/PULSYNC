interface WeekProgressProps {
  weekDays: boolean[]
  today: number
}

const LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function WeekProgress({ weekDays, today }: WeekProgressProps) {
  return (
    <div className="flex justify-between">
      {weekDays.map((done, i) => {
        const isPast = i < today
        const isToday = i === today
        const isFuture = i > today

        let bg = 'bg-surface-high'
        if (isToday) bg = 'bg-transparent ring-2 ring-primary'
        else if (done) bg = 'bg-primary'
        else if (isPast && !done) bg = 'bg-error/30'

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${bg}`}>
              {done && !isToday && <span className="text-bg text-xs font-bold">✓</span>}
              {isFuture && <span className="text-text-muted text-xs">·</span>}
            </div>
            <span className="text-[10px] text-text-muted">{LABELS[i]}</span>
          </div>
        )
      })}
    </div>
  )
}
