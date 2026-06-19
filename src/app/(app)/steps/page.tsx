'use client'

import { useEffect, useState } from 'react'
import { Footprints } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSteps } from '@/hooks/useSteps'
import Skeleton from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

const CARD_STYLE = {
  background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
  borderRadius: 26,
}
const TINT = '#30D158'
const GOAL = 10000

export default function StepsPage() {
  const { user } = useAuth()
  const { logs, loading, fetchStepHistory, logSteps } = useSteps()
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchStepHistory(user.id, 7)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = logs.find((l) => l.date === today)
  const todaySteps = todayLog?.steps ?? 0
  const progress = Math.min(todaySteps / GOAL, 1)

  const weekLogs = logs.slice(0, 7)
  const historyLogs = logs.filter((l) => l.date !== today).slice(0, 6)

  const parsedInput = parseInt(input, 10)
  const isValid = input !== '' && !isNaN(parsedInput) && parsedInput >= 0 && parsedInput <= 100000

  async function handleSave() {
    if (!user || !isValid) return
    setSaving(true)
    try {
      await logSteps(user.id, parsedInput)
      setShowModal(false)
      setInput('')
      toast.success('Passos registrados!')
    } catch {
      toast.error('Erro ao registrar passos.')
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
        <h1 className="screen-title">Passos</h1>
        <Footprints size={22} color={TINT} />
      </div>

      <div style={{ paddingLeft: 20, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Today card */}
        {loading ? (
          <Skeleton className="h-40 rounded-[26px]" />
        ) : (
          <div style={{ ...CARD_STYLE, padding: 22 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(235,235,245,0.4)', marginBottom: 8 }}>Hoje</p>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {todaySteps.toLocaleString('pt-BR')}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(235,235,245,0.5)', marginTop: 4, marginBottom: 16 }}>
              de {GOAL.toLocaleString('pt-BR')} passos
            </p>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: TINT,
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.4)', marginTop: 8 }}>
              {progress >= 1 ? 'Meta atingida!' : `${Math.round(progress * 100)}% da meta`}
            </p>
          </div>
        )}

        {/* This week card */}
        {weekLogs.length > 0 && (
          <div style={{ ...CARD_STYLE, padding: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Esta semana</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
              {[...weekLogs].reverse().map((log, i) => {
                const pct = Math.min(1, log.steps / GOAL)
                return (
                  <div
                    key={log.date}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        background: log.date === today ? TINT : 'rgba(48,209,88,0.35)',
                        borderRadius: '3px 3px 0 0',
                        height: `${Math.max(pct * 60, 2)}px`,
                      }}
                    />
                    <span style={{ fontSize: 9, color: 'rgba(235,235,245,0.4)', fontWeight: 600 }}>
                      {formatDate(log.date + 'T12:00:00', 'EEE').replace('.', '')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History list */}
        {historyLogs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Histórico</p>
            {historyLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  ...CARD_STYLE,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
                  {formatDate(log.date + 'T12:00:00', "d 'de' MMMM")}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {log.steps.toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Register button */}
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
          Registrar passos
        </button>

      </div>

      {/* Bottom-sheet modal */}
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Registrar passos</h2>
            <div>
              <label
                style={{ display: 'block', fontSize: 13, color: 'rgba(235,235,245,0.6)', marginBottom: 6 }}
              >
                Quantos passos você deu hoje?
              </label>
              <input
                type="number"
                min={0}
                max={100000}
                step={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="8432"
                autoFocus
                style={{
                  width: '100%',
                  height: 48,
                  background: '#23262C',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 13,
                  paddingLeft: 14,
                  paddingRight: 14,
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setShowModal(false); setInput('') }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isValid}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  background: isValid && !saving ? TINT : 'rgba(48,209,88,0.3)',
                  color: '#001b08',
                  fontWeight: 700,
                  border: 'none',
                  cursor: saving || !isValid ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
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
