import { Clock } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import type { ChallengeWithParticipants } from '@/hooks/useChallenges'

const CHALLENGE_ICONS: Record<string, string> = {
  steps: '👣',
  workouts: '🏋️',
  habits: '✅',
  calories: '🔥',
  sleep: '😴',
  custom: '🎯',
}

interface ChallengeCardProps {
  challenge: ChallengeWithParticipants
  userProgress?: number
  onJoin?: () => void
}

export default function ChallengeCard({ challenge, userProgress, onJoin }: ChallengeCardProps) {
  const daysLeft = differenceInDays(parseISO(challenge.end_date), new Date())
  const isParticipant = userProgress !== undefined

  return (
    <div className="bg-surface rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{CHALLENGE_ICONS[challenge.type] ?? '🎯'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary">{challenge.title}</p>
          <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{challenge.description}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {challenge.participants.slice(0, 3).map((p) => (
            <Avatar
              key={p.id}
              size="sm"
              name={p.profile.display_name}
              uri={p.profile.avatar_url}
              className="ring-2 ring-surface"
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-text-muted text-xs ml-1">
          <Clock size={12} />
          <span>{daysLeft > 0 ? `${daysLeft} dias restantes` : 'Encerrado'}</span>
        </div>
      </div>

      {isParticipant && (
        <ProgressBar progress={challenge.target_value > 0 ? userProgress / challenge.target_value : 0} />
      )}

      {onJoin ? (
        <Button variant="secondary" fullWidth size="sm" onClick={onJoin}>
          Participar
        </Button>
      ) : (
        <Button variant="ghost" fullWidth size="sm">
          Ver detalhes
        </Button>
      )}
    </div>
  )
}
