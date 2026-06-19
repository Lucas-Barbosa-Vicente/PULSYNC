'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, Settings, Bell, Lock, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import Avatar from '@/components/ui/Avatar'
import XPBar from '@/components/gamification/XPBar'
import StatsGrid from '@/components/profile/StatsGrid'
import ActivityGraph from '@/components/profile/ActivityGraph'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { differenceInDays } from 'date-fns'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { updateProfile } = useProfile()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [stats, setStats] = useState({ workouts: 0, habitsPercent: 0, achievements: 0, level: 0 })
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([wRes, aRes]) => {
      setStats({
        workouts: wRes.count ?? 0,
        habitsPercent: 72,
        achievements: aRes.count ?? 0,
        level: profile?.level ?? 1,
      })
    })
  }, [user, profile])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      await updateProfile(user.id, { avatar: file })
      toast.success('Avatar atualizado!')
    } catch {
      toast.error('Erro ao atualizar avatar.')
    }
  }

  const daysInApp = profile?.created_at
    ? differenceInDays(new Date(), new Date(profile.created_at))
    : 0

  const menuItems = [
    { icon: Settings, label: 'Configurações', href: '/profile/settings' as const },
    { icon: Bell, label: 'Notificações', href: '/profile/notifications' as const },
    { icon: Lock, label: 'Privacidade', href: '/profile/privacy' as const },
  ]

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar size="xl" name={profile?.display_name ?? 'Usuário'} uri={profile?.avatar_url} />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-bg"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-center">
            <p className="text-text-primary font-bold text-xl">{profile?.display_name}</p>
            {profile?.bio && <p className="text-text-muted text-sm mt-1">{profile.bio}</p>}
            <p className="text-text-muted text-xs mt-1">{daysInApp} dias no Pulsync</p>
          </div>
          <XPBar totalXp={profile?.total_xp ?? 0} compact />
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Activity Graph */}
        <div className="bg-surface rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">Atividade</p>
          <ActivityGraph activityData={[]} />
        </div>

        {/* Menu */}
        <div className="bg-surface rounded-2xl divide-y divide-border">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-high transition-colors"
            >
              <item.icon size={18} className="text-text-muted" />
              <span className="text-text-primary text-sm">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-surface-high transition-colors"
          >
            <LogOut size={18} className="text-error" />
            <span className="text-error text-sm">Sair</span>
          </button>
        </div>
      </div>

      {showLogout && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-2">Sair do Pulsync?</h2>
            <p className="text-text-secondary text-sm mb-4">Você precisará entrar novamente.</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowLogout(false)}>
                Cancelar
              </Button>
              <Button variant="danger" fullWidth onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
