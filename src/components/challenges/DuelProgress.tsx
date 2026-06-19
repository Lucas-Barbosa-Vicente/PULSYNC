import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import type { ChallengeParticipant } from '@/types/database.types'

interface Participant extends ChallengeParticipant {
  profile: { display_name: string; avatar_url?: string }
}

interface DuelProgressProps {
  participants: Participant[]
  targetValue: number
  currentUserId: string
}

export default function DuelProgress({ participants, targetValue, currentUserId }: DuelProgressProps) {
  const [p1, p2] = participants.slice(0, 2)
  if (!p1) return null

  const leading = p2 ? (p1.current_value >= p2.current_value ? p1 : p2) : p1

  function renderSide(p: Participant, color: string) {
    const pct = targetValue > 0 ? p.current_value / targetValue : 0
    return (
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {leading.user_id === p.user_id && <span className="text-sm">👑</span>}
          <Avatar size="sm" name={p.profile.display_name} uri={p.profile.avatar_url} />
          <span className="text-sm text-text-primary truncate">{p.profile.display_name}</span>
        </div>
        <ProgressBar progress={pct} color={color} />
        <p className="text-xs text-text-secondary">
          {p.current_value}/{targetValue}
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      {renderSide(p1, 'var(--primary)')}
      <div className="pt-3 text-text-muted font-bold text-sm shrink-0">vs</div>
      {p2 ? renderSide(p2, 'var(--social)') : <div className="flex-1" />}
    </div>
  )
}
