'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Challenge, ChallengeParticipant } from '@/types/database.types'

export type ChallengeWithParticipants = Challenge & {
  participants: (ChallengeParticipant & {
    profile: { display_name: string; avatar_url?: string }
  })[]
}

export function useChallenges() {
  const supabase = createClient()
  const [active, setActive] = useState<ChallengeWithParticipants[]>([])
  const [available, setAvailable] = useState<ChallengeWithParticipants[]>([])
  const [loading, setLoading] = useState(false)

  const fetchActiveChallenges = useCallback(
    async (userId: string) => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('user_id', userId)

        const ids = (data ?? []).map((r: { challenge_id: string }) => r.challenge_id)
        if (ids.length === 0) {
          setActive([])
          return
        }

        const { data: challenges } = await supabase
          .from('challenges')
          .select('*, participants:challenge_participants(*, profile:profiles(display_name, avatar_url))')
          .in('id', ids)
          .eq('status', 'active')

        setActive(challenges ?? [])
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const fetchAvailableChallenges = useCallback(
    async (userId: string) => {
      const { data: joined } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', userId)
      const joinedIds = (joined ?? []).map((r: { challenge_id: string }) => r.challenge_id)

      const { data } = await supabase
        .from('challenges')
        .select('*, participants:challenge_participants(*, profile:profiles(display_name, avatar_url))')
        .eq('status', 'active')
        .eq('is_public', true)
        .not('id', 'in', `(${joinedIds.join(',') || 'null'})`)
        .limit(10)

      setAvailable(data ?? [])
    },
    [supabase]
  )

  const createChallenge = useCallback(
    async (
      userId: string,
      data: Pick<
        Challenge,
        'title' | 'description' | 'type' | 'metric' | 'target_value' | 'unit' | 'start_date' | 'end_date' | 'is_public'
      >
    ) => {
      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({ ...data, creator_id: userId, status: 'active' })
        .select()
        .single()

      if (error || !challenge) throw error

      await supabase.from('challenge_participants').insert({
        challenge_id: challenge.id,
        user_id: userId,
        current_value: 0,
        rank: 1,
      })

      const inviteUrl = `${window.location.origin}/join/${challenge.id}`
      return { challenge, inviteUrl }
    },
    [supabase]
  )

  const joinChallenge = useCallback(
    async (challengeId: string, userId: string) => {
      await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: userId,
        current_value: 0,
        rank: 999,
      })
      await supabase.from('activity_feed').insert({
        user_id: userId,
        type: 'challenge_joined',
        reference_id: challengeId,
        reference_type: 'challenge',
        visibility: 'friends',
        kudos_count: 0,
      })
    },
    [supabase]
  )

  const subscribeToChallenge = useCallback(
    (challengeId: string, onUpdate: () => void) => {
      const channel = supabase
        .channel(`challenge_${challengeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'challenge_participants',
            filter: `challenge_id=eq.${challengeId}`,
          },
          onUpdate
        )
        .subscribe()

      return () => supabase.removeChannel(channel)
    },
    [supabase]
  )

  return {
    active,
    available,
    loading,
    fetchActiveChallenges,
    fetchAvailableChallenges,
    createChallenge,
    joinChallenge,
    subscribeToChallenge,
  }
}
