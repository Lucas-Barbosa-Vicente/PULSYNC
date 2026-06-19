'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cardEntrance } from '@/lib/animations'

interface MetricCardProps {
  title: string
  subtitle?: string
  value: string | number
  unit: string
  color: string
  data?: number[]
  href?: string
}

const TIME_LABELS = ['00', '06', '12', '18']

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max  = Math.max(...data, 1)
  const BAR_H = 32

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${data.length * 6} ${BAR_H}`}
        className="w-full"
        style={{ height: BAR_H }}
        preserveAspectRatio="none"
      >
        {data.map((v, i) => {
          const barH    = Math.max(2, (v / max) * BAR_H)
          const opacity = v === max ? 1 : 0.4
          return (
            <rect
              key={i}
              x={i * 6 + 1}
              y={BAR_H - barH}
              width={4}
              height={barH}
              rx={2}
              fill={color}
              fillOpacity={opacity}
            />
          )
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {TIME_LABELS.map((l) => (
          <span key={l} className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MetricCard({
  title,
  subtitle,
  value,
  unit,
  color,
  data,
  href,
}: MetricCardProps) {
  const content = (
    <motion.div
      variants={cardEntrance}
      className="rounded-[20px] p-4 pressable"
      style={{
        background: 'var(--surface)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </p>
          {subtitle && <p className="label-today">{subtitle}</p>}
        </div>
        {href && (
          <div className="card-arrow">
            <ChevronRight size={14} color="var(--text-secondary)" />
          </div>
        )}
      </div>

      <p className="metric-value mt-2" style={{ color }}>
        {value}
        {unit && (
          <span className="text-base font-medium ml-1" style={{ color }}>
            {unit}
          </span>
        )}
      </p>

      {data && data.length > 0 && <MiniBarChart data={data} color={color} />}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
