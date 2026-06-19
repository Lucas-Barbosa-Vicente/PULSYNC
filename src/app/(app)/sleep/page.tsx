'use client'

import { useEffect, useState } from 'react'
import { Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSleep } from '@/hooks/useSleep'
import SleepArc from '@/components/sleep/SleepArc'
import PhaseBar from '@/components/sleep/PhaseBar'
import Skeleton from '@/components/ui/Skeleton'
import { formatDate, timeAgo } from '@/lib/utils'
import { toast } from 'sonner'

const CARD_STYLE = { background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)', borderRadius: 26 }
const TINT = 'var(--primary)'

export default function SleepPage() {
  const { user } = useAuth()
  const { sessions, loading, fetchSleepHistory, logManualSleep } = useSleep()
  const [showModal, setShowModal] = useState(false)
  const [bedtime, setBedtime]     = useState('')
  const [wakeup, setWakeup]       = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (user) fetchSleepHistory(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const latest  = sessions[0] ?? null
  const weekData = sessions.slice(0, 7).reverse()
  const maxHours = 9

  async function handleSave() {
    if (!user || !bedtime || !wakeup) return
    setSaving(true)
    try {
      await logManualSleep(user.id, new Date(bedtime), new Date(wakeup))
      setShowModal(false)
      setBedtime('')
      setWakeup('')
      toast.success('Sono registrado!')
    } catch {
      toast.error('Erro ao registrar sono.')
    } finally {
      setSaving(false)
    }
  }

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
        <h1 className="screen-title">Sono</h1>
        <Moon size={22} color="#7D7AFF" />
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {loading ? (
          <Skeleton className="h-56 rounded-[26px]" />
        ) : latest ? (
          <div style={{ ...CARD_STYLE, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(235,235,245,0.4)' }}>
              {formatDate(new Date(latest.start_time), 'd MMMM')}
            </p>
            <SleepArc session={latest} />
            <PhaseBar session={latest} />
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
                background: 'rgba(125,122,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Moon size={32} color="#7D7AFF" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
              Nenhum registro de sono
            </p>
          </div>
        )}

        {weekData.length > 0 && (
          <div style={{ ...CARD_STYLE, padding: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Esta semana</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
              {weekData.map((s, i) => {
                const hours = s.duration_minutes / 60
                const pct   = Math.min(1, hours / maxHours)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        background: 'rgba(125,122,255,0.6)',
                        borderRadius: '3px 3px 0 0',
                        height: `${pct * 60}px`,
                      }}
                    />
                    <span style={{ fontSize: 9, color: 'rgba(235,235,245,0.4)', fontWeight: 600 }}>
                      {formatDate(new Date(s.start_time), 'EEE')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {sessions.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Histórico</p>
            {sessions.slice(1, 6).map((s) => (
              <div
                key={s.id}
                style={{
                  ...CARD_STYLE,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
                    {formatDate(new Date(s.start_time), "d MMM 'às' HH:mm")}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.4)', marginTop: 2 }}>
                    {timeAgo(new Date(s.start_time))}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    {Math.floor(s.duration_minutes / 60)}h{s.duration_minutes % 60}min
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.4)', marginTop: 2 }}>
                    {s.qualityLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registrar sono — outline style */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 16,
            background: 'transparent',
            border: `1.5px solid ${TINT}`,
            color: TINT,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Registrar sono
        </button>

      </div>

      {showModal && (
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
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Registrar sono</h2>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(235,235,245,0.6)', marginBottom: 6 }}>
                Fui dormir
              </label>
              <input
                type="datetime-local"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                style={{
                  width: '100%', height: 48, background: '#23262C',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 13,
                  paddingLeft: 14, color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(235,235,245,0.6)', marginBottom: 6 }}>
                Acordei
              </label>
              <input
                type="datetime-local"
                value={wakeup}
                onChange={(e) => setWakeup(e.target.value)}
                style={{
                  width: '100%', height: 48, background: '#23262C',
                  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 13,
                  paddingLeft: 14, color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, height: 48, borderRadius: 14, background: TINT,
                  color: '#001b08', fontWeight: 700, border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
