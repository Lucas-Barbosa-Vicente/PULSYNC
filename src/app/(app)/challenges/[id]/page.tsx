'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { differenceInDays, differenceInHours, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges } from '@/hooks/useChallenges'
import DuelProgress from '@/components/challenges/DuelProgress'
import Header from '@/components/layout/Header'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import type { ChallengeWithParticipants } from '@/hooks/useChallenges'
import { createClient } from '@/lib/supabase/client'

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { subscribeToChallenge } = useChallenges()
  const supabase = createClient()

  const [challenge, setChallenge] = useState<ChallengeWithParticipants | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuit, setShowQuit] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('challenges')
      .select('*, participants:challenge_participants(*, profile:profiles(display_name, avatar_url))')
      .eq('id', id)
      .single()
    setChallenge(data ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const unsub = subscribeToChallenge(id, load)
    return unsub
  }, [id])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!challenge) return <p className="p-4 text-text-secondary">Desafio não encontrado.</p>

  const daysLeft = differenceInDays(parseISO(challenge.end_date), new Date())
  const hoursLeft = differenceInHours(parseISO(challenge.end_date), new Date()) % 24
  const userParticipant = challenge.participants.find((p) => p.user_id === user?.id)

  const sortedByRank = [...challenge.participants].sort(
    (a, b) => b.current_value - a.current_value
  )

  return (
    <div className="pb-4">
      <Header title={challenge.title} showBack backHref="/challenges" />

      <div className="px-4 space-y-4">
        {/* Countdown */}
        <div className="bg-surface rounded-2xl p-4 text-center">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Termina em</p>
          <p className="text-text-primary font-mono font-bold text-2xl">
            {daysLeft}d {hoursLeft}h
          </p>
        </div>

        {/* Duel */}
        <div className="bg-surface rounded-2xl p-4">
          <DuelProgress
            participants={challenge.participants}
            targetValue={challenge.target_value}
            currentUserId={user?.id ?? ''}
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-surface rounded-2xl p-4 space-y-3">
          <p className="font-semibold text-text-primary">Classificação</p>
          {sortedByRank.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                p.user_id === user?.id ? 'bg-surface-high ring-1 ring-primary' : ''
              }`}
            >
              <span className="text-text-muted font-mono w-5 text-sm">#{i + 1}</span>
              <Avatar size="sm" name={p.profile.display_name} uri={p.profile.avatar_url} />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium truncate">{p.profile.display_name}</p>
                <ProgressBar
                  progress={challenge.target_value > 0 ? p.current_value / challenge.target_value : 0}
                  height={4}
                />
              </div>
              <span className="text-text-secondary text-sm shrink-0">
                {p.current_value}/{challenge.target_value}
              </span>
            </div>
          ))}
        </div>

        {userParticipant && (
          <Button variant="ghost" fullWidth onClick={() => setShowQuit(true)}>
            Desistir do desafio
          </Button>
        )}
      </div>

      {showQuit && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-2">Desistir?</h2>
            <p className="text-text-secondary text-sm mb-4">
              Você será removido do desafio. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowQuit(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={async () => {
                  if (!user) return
                  await supabase
                    .from('challenge_participants')
                    .delete()
                    .eq('challenge_id', id)
                    .eq('user_id', user.id)
                  toast.success('Você saiu do desafio.')
                  router.push('/challenges')
                }}
              >
                Desistir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
