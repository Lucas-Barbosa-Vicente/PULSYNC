import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  scrollable?: boolean
}

export default function PageContainer({
  children,
  className,
  scrollable = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'max-w-[430px] mx-auto px-4',
        scrollable && 'overflow-y-auto scroll-smooth',
        className
      )}
    >
      {children}
    </div>
  )
}
