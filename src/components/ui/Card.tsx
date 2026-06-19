import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  glowColor?: string
}

export default function Card({ children, className, onClick, glowColor }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={glowColor ? { boxShadow: `0 0 20px ${glowColor}33` } : undefined}
      className={cn(
        'bg-surface rounded-2xl p-4',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {children}
    </div>
  )
}
