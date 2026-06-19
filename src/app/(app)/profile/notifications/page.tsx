'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'

interface NotifSetting {
  id: string
  label: string
  enabled: boolean
}

export default function NotificationsPage() {
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'habits', label: 'Lembretes de hábitos', enabled: true },
    { id: 'streak', label: 'Aviso de streak em risco', enabled: true },
    { id: 'workout', label: 'Lembrete de treino', enabled: false },
    { id: 'kudos', label: 'Kudos recebidos', enabled: true },
    { id: 'partner', label: 'Atividade da parceira', enabled: true },
    { id: 'achievements', label: 'Conquistas desbloqueadas', enabled: true },
    { id: 'weekly', label: 'Resumo semanal', enabled: false },
  ])

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setPermissionDenied(perm === 'denied')
      })
    }
  }, [])

  function toggle(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  return (
    <div className="pb-4">
      <Header title="Notificações" showBack backHref="/profile" />

      <div className="px-4 space-y-3">
        {permissionDenied && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <p className="text-sm text-error">
              Notificações bloqueadas. Habilite nas configurações do navegador.
            </p>
          </div>
        )}

        <div className="bg-surface rounded-2xl divide-y divide-border">
          {settings.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-text-primary text-sm">{s.label}</span>
              <button
                onClick={() => toggle(s.id)}
                className={`w-11 h-6 rounded-full transition-colors ${s.enabled ? 'bg-primary' : 'bg-surface-high'}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    s.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
