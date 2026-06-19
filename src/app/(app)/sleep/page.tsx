'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSleep } from '@/hooks/useSleep'
import SleepArc from '@/components/sleep/SleepArc'
import PhaseBar from '@/components/sleep/PhaseBar'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { formatDate, timeAgo } from '@/lib/utils'
import { toast } from 'sonner'

export default function SleepPage() {
  const { user } = useAuth()
  const { sessions, loading, fetchSleepHistory, logManualSleep } = useSleep()
  const [showModal, setShowModal] = useState(false)
  const [bedtime, setBedtime] = useState('')
  const [wakeup, setWakeup] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchSleepHistory(user.id)
  }, [user])

  const latest = sessions[0] ?? null

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

  // Weekly chart data
  const weekData = sessions.slice(0, 7).reverse()
  const maxHours = 9

  return (
    <div className="pb-4">
      <Header title="Sono" />

      <div className="px-4 space-y-4">
        {/* Latest session */}
        {loading ? (
          <Skeleton className="h-56 rounded-2xl" />
        ) : latest ? (
          <div className="bg-surface rounded-2xl p-5 space-y-4">
            <p className="text-text-muted text-sm">
              {formatDate(new Date(latest.start_time), 'd MMMM')}
            </p>
            <SleepArc session={latest} />
            <PhaseBar session={latest} />
          </div>
        ) : (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">😴</p>
            <p className="text-text-secondary">Nenhum registro de sono.</p>
          </div>
        )}

        {/* Weekly chart */}
        {weekData.length > 0 && (
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-sm font-semibold text-text-primary mb-3">Esta semana</p>
            <div className="flex items-end gap-2 h-20">
              {weekData.map((s, i) => {
                const hours = s.duration_minutes / 60
                const pct = Math.min(1, hours / maxHours)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-primary/60"
                      style={{ height: `${pct * 72}px` }}
                    />
                    <span className="text-[9px] text-text-muted">
                      {formatDate(new Date(s.start_time), 'EEE')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History */}
        {sessions.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">Histórico</p>
            {sessions.slice(1, 6).map((s) => (
              <div key={s.id} className="bg-surface rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-text-primary text-sm">{formatDate(new Date(s.start_time), "d MMM 'às' HH:mm")}</p>
                  <p className="text-text-muted text-xs">{timeAgo(new Date(s.start_time))}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-mono text-sm">
                    {Math.floor(s.duration_minutes / 60)}h{s.duration_minutes % 60}min
                  </p>
                  <p className="text-xs text-text-muted">{s.qualityLabel}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button fullWidth variant="secondary" onClick={() => setShowModal(true)}>
          Registrar sono
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Registrar sono</h2>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Fui dormir</label>
              <input
                type="datetime-local"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full h-12 bg-bg border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Acordei</label>
              <input
                type="datetime-local"
                value={wakeup}
                onChange={(e) => setWakeup(e.target.value)}
                className="w-full h-12 bg-bg border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button fullWidth loading={saving} onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
