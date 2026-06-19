'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface KudosButtonProps {
  count: number
  hasKudos: boolean
  onPress: () => void
}

export default function KudosButton({ count, hasKudos, onPress }: KudosButtonProps) {
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-1.5 text-sm transition-colors"
    >
      <motion.div
        whileTap={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.25 }}
      >
        <Heart
          size={18}
          className={hasKudos ? 'text-accent fill-accent' : 'text-text-muted'}
        />
      </motion.div>
      <span className={hasKudos ? 'text-accent' : 'text-text-muted'}>{count}</span>
    </button>
  )
}
