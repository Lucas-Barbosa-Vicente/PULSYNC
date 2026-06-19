'use client'

interface ActivityGraphProps {
  activityData: { date: string; count: number }[]
}

function getColor(count: number): string {
  if (count === 0) return 'var(--surface-high)'
  if (count === 1) return 'rgba(0,212,170,0.2)'
  if (count <= 3) return 'rgba(0,212,170,0.5)'
  return 'var(--primary)'
}

export default function ActivityGraph({ activityData }: ActivityGraphProps) {
  const dataMap: Record<string, number> = {}
  for (const d of activityData) dataMap[d.date] = d.count

  // Generate 52 weeks of dates ending today
  const today = new Date()
  const weeks: string[][] = []
  const start = new Date(today)
  start.setDate(today.getDate() - 363)
  start.setDate(start.getDate() - start.getDay())

  let current = new Date(start)
  while (current <= today) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10)
      week.push(dateStr)
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => (
              <div
                key={date}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: getColor(dataMap[date] ?? 0) }}
                title={`${dataMap[date] ?? 0} atividades em ${date}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
