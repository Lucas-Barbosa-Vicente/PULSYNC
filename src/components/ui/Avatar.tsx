import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  size?: AvatarSize
  uri?: string | null
  name: string
  online?: boolean
  className?: string
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ size = 'md', uri, name, online, className }: AvatarProps) {
  const px = sizeMap[size]
  const textSize =
    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-xl'

  return (
    <div className={cn('relative inline-flex shrink-0', className)} style={{ width: px, height: px }}>
      {uri ? (
        <Image
          src={uri}
          alt={name}
          width={px}
          height={px}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white w-full h-full',
            textSize
          )}
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--social))' }}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg" />
      )}
    </div>
  )
}
