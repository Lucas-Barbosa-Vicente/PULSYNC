'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, CheckCircle, Plus, Swords, User, Dumbbell, Moon, Flame, Target } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',       icon: Home,        label: 'Início'   },
  { href: '/habits',     icon: CheckCircle, label: 'Hábitos'  },
  { href: null,          icon: Plus,        label: '',         isFab: true },
  { href: '/challenges', icon: Swords,      label: 'Desafios' },
  { href: '/profile',    icon: User,        label: 'Perfil'   },
]

const SHEET_ITEMS = [
  { icon: Dumbbell, label: 'Iniciar treino',      href: '/workout',        color: '#FF2D55' },
  { icon: Moon,     label: 'Registrar sono',      href: '/sleep',          color: '#7D7AFF' },
  { icon: Flame,    label: 'Adicionar refeição',  href: '/nutrition',      color: '#FF9F0A' },
  { icon: CheckCircle, label: 'Novo hábito',      href: '/habits/new',     color: '#33D6C6' },
  { icon: Target,   label: 'Novo desafio',        href: '/challenges/new', color: '#A6FF00' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      {/* Bottom sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSheet(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 40,
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                background: 'linear-gradient(180deg, #1C1E23 0%, #15161A 100%)',
                borderRadius: '26px 26px 0 0',
                padding: '20px 20px 40px',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                  margin: '0 auto 24px',
                }}
              />
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 16,
                }}
              >
                Adicionar
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SHEET_ITEMS.map(({ icon: Icon, label, href, color }) => (
                  <button
                    key={href}
                    onClick={() => {
                      setShowSheet(false)
                      router.push(href)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 16px',
                      borderRadius: 16,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={color} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          className="flex items-center gap-1 px-4 py-3 rounded-[50px]"
          style={{
            background: 'rgba(28, 30, 35, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label, isFab }) => {
            const isActive = href
              ? (pathname === href || pathname.startsWith(href + '/'))
              : false

            if (isFab) {
              return (
                <motion.button
                  key="fab"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowSheet(true)}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-2"
                  style={{ background: 'var(--primary)' }}
                >
                  <Icon size={22} color="#001b08" strokeWidth={2.5} />
                </motion.button>
              )
            }

            return (
              <Link key={href} href={href!}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center px-3 py-1 gap-1"
                >
                  <div
                    className="p-2 rounded-full transition-colors"
                    style={{
                      background: isActive ? 'rgba(51, 214, 198, 0.15)' : 'transparent',
                    }}
                  >
                    <Icon
                      size={22}
                      color={isActive ? 'var(--primary)' : 'var(--text-secondary)'}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </div>
                  {label && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}
                    >
                      {label}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </motion.div>
      </div>
    </>
  )
}
