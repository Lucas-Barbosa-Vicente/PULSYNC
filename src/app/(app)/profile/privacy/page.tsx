'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function PrivacyPage() {
  const { user, signOut } = useAuth()
  const { exportUserData } = useProfile()
  const supabase = createClient()

  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends')
  const [rankVisible, setRankVisible] = useState(true)
  const [showDelete1, setShowDelete1] = useState(false)
  const [showDelete2, setShowDelete2] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (!user) return
    setExporting(true)
    try {
      await exportUserData(user.id)
    } catch {
      toast.error('Erro ao exportar dados.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (!user || deleteInput !== 'DELETAR') return
    setDeleting(true)
    try {
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`])
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      signOut()
    } catch {
      toast.error('Erro ao deletar conta.')
      setDeleting(false)
    }
  }

  return (
    <div className="pb-4">
      <Header title="Privacidade" showBack backHref="/profile" />

      <div className="px-4 space-y-5">
        {/* Visibility */}
        <div className="bg-surface rounded-2xl p-4 space-y-3">
          <p className="font-semibold text-text-primary">Visibilidade</p>
          <div>
            <label className="text-sm text-text-secondary block mb-2">Quem vê meu perfil</label>
            <div className="flex gap-2">
              {(['public', 'friends', 'private'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={`flex-1 h-9 rounded-xl text-xs font-medium border transition-all ${
                    visibility === v
                      ? 'bg-primary text-bg border-primary'
                      : 'bg-bg border-border text-text-secondary'
                  }`}
                >
                  {v === 'public' ? 'Todos' : v === 'friends' ? 'Parceira' : 'Só eu'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Aparecer no ranking</span>
            <button
              onClick={() => setRankVisible((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors ${rankVisible ? 'bg-primary' : 'bg-surface-high'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  rankVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-surface rounded-2xl p-4">
          <p className="font-semibold text-text-primary mb-3">Meus Dados</p>
          <Button variant="secondary" fullWidth loading={exporting} onClick={handleExport}>
            📥 Exportar meus dados
          </Button>
          <div className="flex gap-4 mt-3 justify-center">
            <a href="#" className="text-xs text-primary hover:underline">Política de Privacidade</a>
            <a href="#" className="text-xs text-primary hover:underline">Termos de Uso</a>
          </div>
        </div>

        {/* Delete account */}
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4 space-y-3">
          <p className="font-semibold text-text-primary">Conta</p>
          <p className="text-xs text-text-muted leading-relaxed">
            O Pulsync não é um dispositivo médico e não diagnostica, trata ou cura nenhuma condição médica.
          </p>
          <Button variant="danger" fullWidth onClick={() => setShowDelete1(true)}>
            🗑️ Deletar minha conta
          </Button>
        </div>
      </div>

      {showDelete1 && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-2">Deletar conta?</h2>
            <p className="text-text-secondary text-sm mb-4">
              Todos os seus dados serão permanentemente apagados. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowDelete1(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => { setShowDelete1(false); setShowDelete2(true) }}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDelete2 && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end z-50 px-4 pb-8">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[430px] mx-auto">
            <h2 className="text-lg font-bold text-text-primary mb-2">Confirmar exclusão</h2>
            <p className="text-text-secondary text-sm mb-3">
              Digite <span className="text-error font-bold">DELETAR</span> para confirmar.
            </p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full h-12 bg-bg border border-border rounded-xl px-4 text-text-primary focus:outline-none focus:border-error mb-4"
            />
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => { setShowDelete2(false); setDeleteInput('') }}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deleting}
                disabled={deleteInput !== 'DELETAR'}
                onClick={handleDelete}
              >
                Deletar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
