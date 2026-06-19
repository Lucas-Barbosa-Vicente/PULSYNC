'use client'

import { MessageCircle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import KudosButton from '@/components/feed/KudosButton'
import { timeAgo, formatDuration, formatDistance, formatCalories } from '@/lib/utils'
import type { FeedItem } from '@/hooks/useFeed'

const MOTIVATIONAL = [
  'Incrível consistência! 🔥',
  'Seguindo forte! 💪',
  'Sem parar! 🚀',
  'Hábito construído! ✅',
  'Determinação total! 🎯',
]

interface ActivityCardProps {
  item: FeedItem
  onKudos: () => void
}

export default function ActivityCard({ item, onKudos }: ActivityCardProps) {
  const motivational = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]

  if (item.type === 'workout') {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="sm" name={item.profile.display_name} uri={item.profile.avatar_url} />
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-medium text-sm truncate">
              {item.profile.display_name}
            </p>
            <p className="text-text-muted text-xs">{timeAgo(new Date(item.created_at))}</p>
          </div>
          <span className="text-xs text-text-secondary">🏋️ Treino</span>
        </div>
        <div className="flex gap-4 text-sm text-text-secondary mb-3">
          <span>⏱ {formatDuration(0)}</span>
          <span>📍 {formatDistance(0)}</span>
          <span>🔥 {formatCalories(0)}</span>
        </div>
        <div className="flex items-center gap-4">
          <KudosButton count={item.kudos_count} hasKudos={item.hasKudos} onPress={onKudos} />
          <button className="flex items-center gap-1.5 text-sm text-text-muted">
            <MessageCircle size={18} />
            <span>0</span>
          </button>
        </div>
      </Card>
    )
  }

  if (item.type === 'habit_streak') {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-2">
          <Avatar size="sm" name={item.profile.display_name} uri={item.profile.avatar_url} />
          <p className="text-text-primary font-medium text-sm">{item.profile.display_name}</p>
          <p className="text-text-muted text-xs ml-auto">{timeAgo(new Date(item.created_at))}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-text-primary font-semibold">Streak ativo!</p>
            <p className="text-text-secondary text-sm">{motivational}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <KudosButton count={item.kudos_count} hasKudos={item.hasKudos} onPress={onKudos} />
        </div>
      </Card>
    )
  }

  if (item.type === 'achievement') {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="sm" name={item.profile.display_name} uri={item.profile.avatar_url} />
          <p className="text-text-primary font-medium text-sm">{item.profile.display_name}</p>
          <p className="text-text-muted text-xs ml-auto">{timeAgo(new Date(item.created_at))}</p>
        </div>
        <div className="text-center py-2">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-text-primary font-semibold">Nova Conquista!</p>
          <p className="text-text-secondary text-sm">Desbloqueou uma conquista</p>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <KudosButton count={item.kudos_count} hasKudos={item.hasKudos} onPress={onKudos} />
        </div>
      </Card>
    )
  }

  return null
}
