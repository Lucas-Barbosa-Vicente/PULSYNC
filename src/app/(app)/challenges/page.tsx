'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Plus, Swords } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges } from '@/hooks/useChallenges'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import DuelProgress from '@/components/challenges/DuelProgress'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

const CARD_STYLE = {
  background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
  borderRadius: 26,
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const { active, available, loading, fetchActiveChallenges, fetchAvailableChallenges, joinChallenge } =
    useChallenges()

  useEffect(() => {
    if (user) {
      fetchActiveChallenges(user.id)
      fetchAvailableChallenges(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="pb-32 min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 56,
          paddingBottom: 8,
          paddingLeft: 20,
          paddingRight: 20,
          marginBottom: 8,
        }}
      >
        <h1 className="screen-title">Desafios</h1>
        <Link
          href="/challenges/new"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(51,214,198,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={20} color="var(--primary)" strokeWidth={2.5} />
        </Link>
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <Skeleton className="h-40 rounded-[26px]" />
        ) : featuredChallenge ? (
          <div style={{ ...CARD_STYLE, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'rgba(235,235,245,0.4)', marginBottom: 8 }}>
              Desafio Ativo
            </p>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: 16, marginBottom: 12 }}>
              ⚔️ {featuredChallenge.title}
            </p>
            <DuelProgress
              participants={featuredChallenge.participants}
              targetValue={featuredChallenge.target_value}
              currentUserId={user?.id ?? ''}
            />
            <Link href={`/challenges/${featuredChallenge.id}`} style={{ marginTop: 12, display: 'block' }}>
              <Button fullWidth size="sm" variant="secondary">
                Ver detalhes
              </Button>
            </Link>
          </div>
        ) : (
          <div
            style={{
              ...CARD_STYLE,
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(51,214,198,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Swords size={32} color="var(--primary)" />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
              Desafie sua parceira!
            </p>
            <Link href="/challenges/new">
              <button
                style={{
                  marginTop: 4,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderRadius: 14,
                  background: 'var(--primary)',
                  color: '#001b08',
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Criar desafio
              </button>
            </Link>
          </div>
        )}

        {available.length > 0 && (
          <>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginTop: 4 }}>Disponíveis</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
