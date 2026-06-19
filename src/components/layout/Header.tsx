import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  rightElement?: ReactNode
  transparent?: boolean
  className?: string
}

export default function Header({
  title,
  showBack,
  backHref = '/',
  rightElement,
  transparent,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'h-14 flex items-center px-4 gap-3',
        !transparent && 'bg-bg',
        className
      )}
    >
      {showBack && (
        <Link href={backHref} className="text-text-primary hover:text-primary transition-colors -ml-1">
          <ChevronLeft size={24} />
        </Link>
      )}
      {title && (
        <h1 className={cn('font-bold text-text-primary text-lg', showBack ? '' : 'flex-1')}>
          {title}
        </h1>
      )}
      {rightElement && <div className="ml-auto">{rightElement}</div>}
    </header>
  )
}
