'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'

export function useProfile() {
  const supabase = createClient()

  const updateProfile = useCallback(
    async (userId: string, data: { display_name?: string; bio?: string; avatar?: File }) => {
      let avatarUrl: string | undefined

      if (data.avatar) {
        const ext = data.avatar.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        await supabase.storage.from('avatars').upload(path, data.avatar, { upsert: true })
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }

      const updates: Partial<Profile> = {}
      if (data.display_name) updates.display_name = data.display_name
      if (data.bio !== undefined) updates.bio = data.bio
      if (avatarUrl) updates.avatar_url = avatarUrl
      updates.updated_at = new Date().toISOString()

      const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
      if (error) throw error
    },
    [supabase]
  )

  const updatePrivacySettings = useCallback(
    async (userId: string, settings: Profile['privacy_settings']) => {
      await supabase.from('profiles').update({ privacy_settings: settings }).eq('id', userId)
    },
    [supabase]
  )

  const exportUserData = useCallback(
    async (userId: string) => {
      const [profileRes, habitsRes, workoutsRes, mealsRes, sleepRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('habits').select('*, logs:habit_logs(*)').eq('user_id', userId),
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('meals').select('*, items:meal_items(*)').eq('user_id', userId),
        supabase.from('sleep_sessions').select('*').eq('user_id', userId),
      ])

      const exportData = {
        profile: profileRes.data,
        habits: habitsRes.data,
        workouts: workoutsRes.data,
        meals: mealsRes.data,
        sleep: sleepRes.data,
        exported_at: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pulsync-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [supabase]
  )

  return { updateProfile, updatePrivacySettings, exportUserData }
}
