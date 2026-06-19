'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Settings, Bell, Lock, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { differenceInDays } from 'date-fns'
import { toast } from 'sonner'

const CARD_STYLE = { background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)', borderRadius: 26 }
const TINT = 'var(--primary)'

function HeatmapCell({ count }: { count: number }) {
  let bg = 'rgba(255,255,255,0.045)'
  if (count === 1) bg = 'rgba(48,209,88,0.18)'
  else if (count === 2) bg = 'rgba(48,209,88,0.36)'
  else if (count <= 4) bg = 'rgba(48,209,88,0.60)'
  else if (count > 4)  bg = 'rgba(48,209,88,0.96)'
  return (
    <div
      style={{
        aspectRatio: '1',
        borderRadius: 2,
        background: bg,
      }}
    />
  )
}

function ActivityHeatmap({ activityData }: { activityData: { date: string; count: number }[] }) {
  const dataMap: Record<string, number> = {}
  for (const d of activityData) dataMap[d.date] = d.count

  const today = new Date()
  const cols: string[][] = []
  const start = new Date(today)
  start.setDate(today.getDate() - 19 * 7 + 1)
  start.setDate(start.getDate() - start.getDay())

  let current = new Date(start)
  while (current <= today) {
    const col: string[] = []
    for (let d = 0; d < 7; d++) {
      col.push(current.toISOString().slice(0, 10))
      current.setDate(current.getDate() + 1)
    }
    cols.push(col)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 3 }}>
      {cols.map((col, ci) =>
        col.map((date) => (
          <HeatmapCell key={`${ci}-${date}`} count={dataMap[date] ?? 0} />
        ))
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { updateProfile } = useProfile()
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [stats, setStats] = useState({ workouts: 0, habitsPercent: 72, achievements: 0, level: 1 })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const daysInApp   = profile?.created_at
    ? differenceInDays(new Date(), new Date(profile.created_at))
    : 0

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const statsGrid = [
    { label: 'Treinos',     value: stats.workouts       },
    { label: 'Hábitos',     value: `${stats.habitsPercent}%` },
    { label: 'Conquistas',  value: stats.achievements   },
    { label: 'Nível',       value: stats.level          },
  ]

  const menuItems = [
    { icon: Settings, label: 'Configurações',  href: '/profile/settings'      as const },
    { icon: Bell,     label: 'Notificações',   href: '/profile/notifications' as const },
    { icon: Lock,     label: 'Privacidade',    href: '/profile/privacy'       as const },
  ]

  return (
    <div className="pb-32 min-h-screen" style={{ background: 'var(--bg)' }}>
      <div
        style={{
          paddingTop: 56,
          paddingLeft: 20,
          paddingRight: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'linear-gradient(140deg,#7B5BFF,#33D6C6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: TINT,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={14} color="#001b08" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{displayName}</p>
            <p style={{ fontSize: 14, color: 'rgba(235,235,245,0.4)', marginTop: 4 }}>
              {daysInApp} dias no Pulsync
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: TINT, marginTop: 2 }}>
              Nv. {stats.level} · {profile?.total_xp ?? 0} XP
            </p>
          </div>
        </div>

        {/* Stats 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {statsGrid.map(({ label, value }) => (
            <div
              key={label}
              style={{ ...CARD_STYLE, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(235,235,245,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div style={{ ...CARD_STYLE, padding: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Atividade</p>
          <ActivityHeatmap activityData={[]} />
        </div>

        {/* Menu list */}
        <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
          {menuItems.map(({ icon: Icon, label, href }, idx) => (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.09)',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} color="rgba(235,235,245,0.5)" />
              <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{label}</span>
            </Link>
          ))}
          <button
            onClick={() => setShowLogout(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <LogOut size={18} color="#FF453A" />
            <span style={{ fontSize: 16, fontWeight: 500, color: '#FF453A' }}>Sair</span>
          </button>
        </div>

      </div>

      {showLogout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,11,13,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 50,
            padding: '0 20px',
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
              borderRadius: 26,
              padding: 24,
              width: '100%',
              maxWidth: 430,
              margin: '0 auto',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Sair do Pulsync?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(235,235,245,0.6)', marginBottom: 20 }}>
              Você precisará entrar novamente.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLogout(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={signOut}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: '#FF453A',
                  color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
