import { formatDuration, formatDistance, formatCalories, timeAgo } from '@/lib/utils'
import { WORKOUT_TYPES } from '@/constants/theme'
import type { Workout } from '@/types/database.types'

interface WorkoutCardProps {
  workout: Workout
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const wType = WORKOUT_TYPES.find((t) => t.id === workout.type)

  return (
    <div
      className="bg-surface rounded-2xl p-4 flex items-start gap-3"
      style={{ borderLeft: `4px solid ${wType?.color ?? 'var(--primary)'}` }}
    >
      <span className="text-2xl">{wType?.icon ?? '🏃'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-text-primary font-semibold text-sm truncate">{workout.title}</p>
          {workout.is_pr && (
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full shrink-0 ml-2">
              🏆 Recorde!
            </span>
          )}
        </div>
        <p className="text-text-muted text-xs mb-2">{timeAgo(new Date(workout.start_time))}</p>
        <div className="flex gap-3 text-xs text-text-secondary">
          <span>⏱ {formatDuration(workout.duration_seconds)}</span>
          {(workout.distance_meters ?? 0) > 0 && (
            <span>📍 {formatDistance(workout.distance_meters ?? 0)}</span>
          )}
          {(workout.calories ?? 0) > 0 && (
            <span>🔥 {formatCalories(workout.calories ?? 0)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
