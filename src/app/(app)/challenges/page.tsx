'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges } from '@/hooks/useChallenges'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import DuelProgress from '@/components/challenges/DuelProgress'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

export default function ChallengesPage() {
  const { user } = useAuth()
  const { active, available, loading, fetchActiveChallenges, fetchAvailableChallenges, joinChallenge } =
    useChallenges()

  useEffect(() => {
    if (user) {
      fetchActiveChallenges(user.id)
      fetchAvailableChallenges(user.id)
    }
  }, [user])

  async function handleJoin(challengeId: string) {
    if (!user) return
    try {
      await joinChallenge(challengeId, user.id)
      toast.success('Você entrou no desafio!')
      fetchActiveChallenges(user.id)
      fetchAvailableChallenges(user.id)
    } catch {
      toast.error('Erro ao entrar no desafio.')
    }
  }

  const featuredChallenge = active[0]

  return (
    <div className="pb-4">
      <Header
        title="Desafios"
        rightElement={
          <Link href="/challenges/new" className="p-2 -mr-2 text-primary">
            <Plus size={22} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : featuredChallenge ? (
          <div className="bg-surface-high rounded-2xl p-4 space-y-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Desafio Ativo</p>
            <p className="font-bold text-text-primary">⚔️ {featuredChallenge.title}</p>
            <DuelProgress
              participants={featuredChallenge.participants}
              targetValue={featuredChallenge.target_value}
              currentUserId={user?.id ?? ''}
            />
            <Link href={`/challenges/${featuredChallenge.id}`}>
              <Button fullWidth size="sm" variant="secondary">
                Ver detalhes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-center bg-surface rounded-2xl">
            <span className="text-4xl mb-3">⚔️</span>
            <p className="text-text-secondary font-medium">Desafie sua parceira!</p>
            <Link href="/challenges/new" className="mt-3">
              <Button size="sm">Criar desafio</Button>
            </Link>
          </div>
        )}

        {/* Available challenges */}
        {available.length > 0 && (
          <>
            <p className="font-semibold text-text-primary">Disponíveis</p>
            <div className="space-y-3">
              {available.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onJoin={() => handleJoin(c.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
