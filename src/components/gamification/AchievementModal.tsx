'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AchievementBadge from '@/components/gamification/AchievementBadge'
import Button from '@/components/ui/Button'
import type { AchievementWithProgress } from '@/hooks/useAchievements'

interface AchievementModalProps {
  pending: AchievementWithProgress[]
  onClose: (achievement: AchievementWithProgress) => void
}

export default function AchievementModal({ pending, onClose }: AchievementModalProps) {
  const current = pending[0]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (current) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose(current), 300)
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [current])

  function handleClose() {
    setVisible(false)
    setTimeout(() => onClose(current), 300)
  }

  if (!current) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-end justify-center z-[100] px-4 pb-8"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="bg-surface rounded-2xl p-8 w-full max-w-[430px] flex flex-col items-center gap-4"
          >
            {pending.length > 1 && (
              <p className="text-xs text-text-muted">1 de {pending.length}</p>
            )}
            <p className="text-lg font-bold text-text-primary">🎉 Nova Conquista!</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AchievementBadge achievement={current} size="xl" />
            </motion.div>
            <p className="text-2xl font-black text-text-primary text-center">{current.name}</p>
            <p className="text-text-secondary text-sm text-center">{current.description}</p>
            <span className="text-primary font-bold text-lg">+{current.xp_reward} XP</span>
            <Button fullWidth onClick={handleClose}>
              Incrível!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
