'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckCircle, Plus, Trophy, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',       icon: Home,        label: 'Início'   },
  { href: '/habits',     icon: CheckCircle, label: 'Hábitos'  },
  { href: '/workout',    icon: Plus,        label: '',         isFab: true },
  { href: '/challenges', icon: Trophy,      label: 'Desafios' },
  { href: '/profile',    icon: User,        label: 'Perfil'   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        className="flex items-center gap-1 px-4 py-3 rounded-[50px]"
        style={{
          background: 'rgba(28, 28, 30, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label, isFab }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')

          if (isFab) {
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-2"
                  style={{ background: 'var(--primary)' }}
                >
                  <Icon size={22} color="#000" strokeWidth={2.5} />
                </motion.div>
              </Link>
            )
          }

          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center px-3 py-1 gap-1"
              >
                <div
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: isActive ? 'rgba(0, 212, 170, 0.15)' : 'transparent',
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
                    className="text-[10px] font-medium"
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
  )
}
