import { cn } from '@/lib/utils'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface BadgeProps {
  tier: Tier
  icon: string
  name: string
  locked?: boolean
}

const tierStyles: Record<Tier, { ring: string; shadow: string; bg: string }> = {
  bronze: {
    ring: 'ring-2 ring-bronze',
    shadow: 'shadow-[0_0_12px_rgba(205,127,50,0.4)]',
    bg: 'bg-bronze/10',
  },
  silver: {
    ring: 'ring-2 ring-silver',
    shadow: 'shadow-[0_0_12px_rgba(192,192,192,0.4)]',
    bg: 'bg-silver/10',
  },
  gold: {
    ring: 'ring-2 ring-gold',
    shadow: 'shadow-[0_0_12px_rgba(255,215,0,0.4)]',
    bg: 'bg-gold/10',
  },
  platinum: {
    ring: 'ring-2 ring-social',
    shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    bg: 'bg-social/10',
  },
}

export default function Badge({ tier, icon, name, locked }: BadgeProps) {
  const styles = tierStyles[tier]

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center text-2xl',
          styles.bg,
          styles.ring,
          styles.shadow,
          locked && 'grayscale opacity-40'
        )}
      >
        {icon}
        {locked && (
          <div className="absolute inset-0 rounded-full bg-bg/60 flex items-center justify-center text-base">
            🔒
          </div>
        )}
      </div>
      <span className="text-[10px] text-text-secondary text-center leading-tight max-w-[56px]">
        {name}
      </span>
    </div>
  )
}
