'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false
  return (window.navigator as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem('pulsync-install-dismissed')) return

    if (isIOS()) {
      setShowIOS(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pulsync-install-dismissed', '1')
    setShowAndroid(false)
    setShowIOS(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowAndroid(false)
      setDeferredPrompt(null)
    }
  }

  if (showAndroid) {
    return (
      <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto z-[200] bg-surface border-b border-border px-4 py-3 flex items-center gap-3 shadow-lg">
        <span className="text-xl shrink-0">📲</span>
        <p className="flex-1 text-sm text-text-primary">Instalar Pulsync no seu celular</p>
        <Button size="sm" onClick={handleInstall}>Instalar</Button>
        <button onClick={dismiss} className="text-text-muted hover:text-text-primary ml-1">
          <X size={16} />
        </button>
      </div>
    )
  }

  if (showIOS) {
    return (
      <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto z-[200] bg-surface border-b border-border px-4 py-3 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📲</span>
            <p className="text-sm text-text-primary font-medium">Instalar no iPhone</p>
          </div>
          <button onClick={dismiss} className="text-text-muted hover:text-text-primary -mt-0.5">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-1 ml-7">
          Toque em Compartilhar ⬆️ → "Adicionar à Tela de Início"
        </p>
      </div>
    )
  }

  return null
}
