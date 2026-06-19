# Apple Fitness Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the PULSYNC visual identity to match Apple Fitness — preto puro, pílula flutuante, anéis animados, métricas coloridas com mini gráficos de barras.

**Architecture:** Atualizar o sistema de cores global, criar componentes visuais novos (ActivityRing, MetricCard, WorkoutTypeCard, PageHeader), redesenhar BottomNav como pílula flutuante, e reconstruir a home page com o novo layout Apple Fitness.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Tailwind CSS v4 (`@theme` block) · Framer Motion · lucide-react · SVG nativo

## Global Constraints

- TypeScript strict — sem `any`
- CSS Variables para cores — nunca hex hardcoded no JSX/TSX
- Tailwind v4 — usar bloco `@theme` em `globals.css`, NÃO `tailwind.config.ts`
- `'use client'` apenas onde há interatividade real
- Default exports em todos os componentes (padrão do projeto)
- Path alias `@/` aponta para `src/`
- `BottomNav` permanece default export (importado em `src/app/(app)/layout.tsx`)
- `pb-28` no container da home para não ficar atrás da pílula flutuante (estava `pb-20`)

---

### Task 1: globals.css — Novo sistema de cores + tipografia + utilitários

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: variáveis CSS `--bg`, `--surface`, `--surface-high`, `--surface-card`, `--primary`, `--accent`, `--social`, `--metric-move`, `--metric-steps`, `--metric-dist`, `--metric-sleep`, `--metric-heart`, `--metric-water`, `--workout-bg`, `--workout-icon`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, conquistas; classes `.glass`, `.glow-primary`, `.glow-move`, `.glow-steps`, `.glow-dist`, `.pressable`, `.card-arrow`, `.metric-value`, `.metric-value-large`, `.label-today`, `.title-display`, `.title-section`

- [ ] **Substituir o conteúdo completo de `src/app/globals.css`:**

```css
@import "tailwindcss";

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* FUNDOS */
  --bg          : #000000;
  --surface     : #1C1C1E;
  --surface-high: #2C2C2E;
  --surface-card: #141414;

  /* CORES PRIMÁRIAS */
  --primary     : #00D4AA;
  --accent      : #FF6B35;
  --social      : #A855F7;

  /* MÉTRICAS */
  --metric-move : #FF375F;
  --metric-steps: #AF52DE;
  --metric-dist : #30D158;
  --metric-sleep: #0A84FF;
  --metric-heart: #FF6961;
  --metric-water: #32ADE6;

  /* TREINO */
  --workout-bg  : #0D2E0D;
  --workout-icon: #B5E61D;

  /* TEXTOS */
  --text-primary  : #FFFFFF;
  --text-secondary: #8E8E93;
  --text-muted    : #48484A;

  /* BORDAS */
  --border      : #38383A;

  /* STATUS */
  --success     : #30D158;
  --warning     : #FF9F0A;
  --error       : #FF453A;

  /* CONQUISTAS */
  --bronze  : #CD7F32;
  --silver  : #C0C0C0;
  --gold    : #FFD700;
  --platinum: #E8E8F0;
}

body {
  background-color: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-mono {
  font-family: var(--font-mono, 'JetBrains Mono', 'Roboto Mono', monospace);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Tipografia Apple-like */
h1, .title-display {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

h2, .title-section {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  letter-spacing: -1px;
}

.metric-value-large {
  font-size: 52px;
  font-weight: 900;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  letter-spacing: -2px;
}

.label-today {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Glassmorphism */
.glass {
  background: rgba(28, 28, 30, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Glows */
.glow-primary { box-shadow: 0 0 20px rgba(0, 212, 170, 0.25); }
.glow-move    { box-shadow: 0 0 20px rgba(255, 55, 95, 0.25); }
.glow-steps   { box-shadow: 0 0 20px rgba(175, 82, 222, 0.25); }
.glow-dist    { box-shadow: 0 0 20px rgba(48, 209, 88, 0.25); }

/* Pressable */
.pressable {
  transition: transform 150ms ease;
  cursor: pointer;
}
.pressable:active { transform: scale(0.96); }

/* Seta de navegação nos cards (estilo iOS) */
.card-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(0, 212, 170, 0); }
}

@theme {
  --color-bg          : var(--bg);
  --color-surface     : var(--surface);
  --color-surface-high: var(--surface-high);
  --color-surface-card: var(--surface-card);
  --color-primary     : var(--primary);
  --color-accent      : var(--accent);
  --color-social      : var(--social);
  --color-metric-move : var(--metric-move);
  --color-metric-steps: var(--metric-steps);
  --color-metric-dist : var(--metric-dist);
  --color-metric-sleep: var(--metric-sleep);
  --color-metric-heart: var(--metric-heart);
  --color-metric-water: var(--metric-water);
  --color-workout-bg  : var(--workout-bg);
  --color-workout-icon: var(--workout-icon);
  --color-text-primary  : var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted    : var(--text-muted);
  --color-success : var(--success);
  --color-warning : var(--warning);
  --color-error   : var(--error);
  --color-border  : var(--border);
  --color-bronze  : var(--bronze);
  --color-silver  : var(--silver);
  --color-gold    : var(--gold);
  --color-platinum: var(--platinum);
  --font-sans: var(--font-inter, 'Inter', sans-serif);
  --font-mono: var(--font-mono, 'JetBrains Mono', monospace);
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit` (deve passar sem erros — CSS não afeta TS)

---

### Task 2: theme.ts — Atualizar tokens de cor

**Files:**
- Modify: `src/constants/theme.ts`

**Interfaces:**
- Consumes: nada
- Produces: `COLORS` (com novas cores), `METRIC_COLORS`, `TIER_COLORS`, `WORKOUT_TYPES`

- [ ] **Substituir o conteúdo completo de `src/constants/theme.ts`:**

```typescript
export const COLORS = {
  bg: '#000000',
  surface: '#1C1C1E',
  surfaceHigh: '#2C2C2E',
  surfaceCard: '#141414',
  primary: '#00D4AA',
  accent: '#FF6B35',
  social: '#A855F7',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#48484A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  border: '#38383A',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E8E8F0',
} as const

export const METRIC_COLORS = {
  move : '#FF375F',
  steps: '#AF52DE',
  dist : '#30D158',
  sleep: '#0A84FF',
  heart: '#FF6961',
  water: '#32ADE6',
  workout: '#FF6B35',
} as const

export const TIER_COLORS = {
  bronze  : '#CD7F32',
  silver  : '#C0C0C0',
  gold    : '#FFD700',
  platinum: '#E8E8F0',
} as const

export const WORKOUT_TYPES = [
  { id: 'run',      name: 'Corrida',     icon: '🏃', metValue: 9.8,  color: '#00D4AA' },
  { id: 'walk',     name: 'Caminhada',   icon: '🚶', metValue: 3.5,  color: '#30D158' },
  { id: 'bike',     name: 'Ciclismo',    icon: '🚴', metValue: 8.0,  color: '#FF9F0A' },
  { id: 'swim',     name: 'Natação',     icon: '🏊', metValue: 8.3,  color: '#0A84FF' },
  { id: 'strength', name: 'Musculação',  icon: '🏋️', metValue: 5.0,  color: '#AF52DE' },
  { id: 'hiit',     name: 'HIIT',        icon: '⚡', metValue: 10.3, color: '#FF6B35' },
  { id: 'yoga',     name: 'Yoga',        icon: '🧘', metValue: 2.5,  color: '#FF375F' },
  { id: 'pilates',  name: 'Pilates',     icon: '🤸', metValue: 3.0,  color: '#AF52DE' },
  { id: 'football', name: 'Futebol',     icon: '⚽', metValue: 7.0,  color: '#30D158' },
  { id: 'tennis',   name: 'Tênis',       icon: '🎾', metValue: 7.3,  color: '#FF9F0A' },
  { id: 'other',    name: 'Outro',       icon: '💪', metValue: 5.0,  color: '#8E8E93' },
] as const
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 3: animations.ts — Biblioteca de animações Framer Motion

**Files:**
- Create: `src/lib/animations.ts`

**Interfaces:**
- Consumes: nada
- Produces: `fadeInUp`, `staggerContainer`, `cardEntrance`, `tapScale` (objetos de variantes Framer Motion)

- [ ] **Criar `src/lib/animations.ts`:**

```typescript
import type { Variants, Transition } from 'framer-motion'

export const fadeInUp: { initial: object; animate: object; transition: Transition } = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
}

export const cardEntrance: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

export const tapScale = {
  whileTap: { scale: 0.95 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 4: BottomNav.tsx — Pílula flutuante estilo Apple Fitness

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

**Interfaces:**
- Consumes: `framer-motion` (motion, AnimatePresence), `next/link`, `next/navigation` (usePathname), `lucide-react`
- Produces: `export default function BottomNav()` — sem props

- [ ] **Substituir `src/components/layout/BottomNav.tsx`:**

```tsx
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
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 5: PageHeader.tsx — Header estilo Apple Fitness

**Files:**
- Create: `src/components/layout/PageHeader.tsx`

**Interfaces:**
- Consumes: `@/components/ui/Avatar`
- Produces: `export default function PageHeader(props: PageHeaderProps)`

```typescript
interface PageHeaderProps {
  title: string
  subtitle?: string
  avatarName?: string
  avatarUri?: string | null
}
```

- [ ] **Criar `src/components/layout/PageHeader.tsx`:**

```tsx
import Avatar from '@/components/ui/Avatar'

interface PageHeaderProps {
  title: string
  subtitle?: string
  avatarName?: string
  avatarUri?: string | null
}

export default function PageHeader({ title, subtitle, avatarName, avatarUri }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between pt-12 pb-2 px-4">
      <div>
        <h1 className="title-display">{title}</h1>
        {subtitle && (
          <p className="label-today mt-0.5">{subtitle}</p>
        )}
      </div>
      {avatarName && (
        <Avatar
          size="md"
          name={avatarName}
          uri={avatarUri}
          className="border-2 border-primary mt-1"
        />
      )}
    </div>
  )
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 6: ActivityRing.tsx — Anel SVG animado

**Files:**
- Create: `src/components/ui/ActivityRing.tsx`

**Interfaces:**
- Consumes: `framer-motion` (motion)
- Produces: `export default function ActivityRing(props: ActivityRingProps)`

```typescript
interface RingData {
  progress: number   // 0–1
  color: string      // CSS color string
}

interface ActivityRingProps {
  rings: RingData[]  // até 4 anéis, do externo para o interno
  size?: number      // default 120
}
```

- [ ] **Criar `src/components/ui/ActivityRing.tsx`:**

```tsx
'use client'

import { motion } from 'framer-motion'

interface RingData {
  progress: number
  color: string
}

interface ActivityRingProps {
  rings: RingData[]
  size?: number
}

const BASE_RADIUS = 52
const RING_GAP    = 14
const STROKE_W    = 10

export default function ActivityRing({ rings, size = 120 }: ActivityRingProps) {
  const viewBox = 120

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={size}
      height={size}
    >
      {rings.map((ring, i) => {
        const r          = BASE_RADIUS - i * RING_GAP
        const circumference = 2 * Math.PI * r
        const offset     = circumference * (1 - Math.min(ring.progress, 1))

        return (
          <g key={i}>
            {/* trilha */}
            <circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={`${ring.color}22`}
              strokeWidth={STROKE_W}
            />
            {/* progresso animado */}
            <motion.circle
              cx={viewBox / 2}
              cy={viewBox / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
              transform={`rotate(-90 ${viewBox / 2} ${viewBox / 2})`}
              style={{ filter: `drop-shadow(0 0 6px ${ring.color})` }}
            />
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 7: MetricCard.tsx — Card com mini gráfico de barras

**Files:**
- Create: `src/components/ui/MetricCard.tsx`

**Interfaces:**
- Consumes: `framer-motion` (motion), `lucide-react` (ChevronRight), `next/link`
- Produces: `export default function MetricCard(props: MetricCardProps)`

```typescript
interface MetricCardProps {
  title: string
  subtitle?: string
  value: string | number
  unit: string
  color: string
  data?: number[]
  href?: string
}
```

- [ ] **Criar `src/components/ui/MetricCard.tsx`:**

```tsx
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
  const max = Math.max(...data, 1)
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
        <span className="text-base font-medium ml-1" style={{ color }}>
          {unit}
        </span>
      </p>

      {data && data.length > 0 && <MiniBarChart data={data} color={color} />}
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 8: WorkoutTypeCard.tsx — Card verde lima estilo Apple Fitness

**Files:**
- Create: `src/components/workout/WorkoutTypeCard.tsx`

**Interfaces:**
- Consumes: `framer-motion` (motion), `next/link`, `lucide-react` (Play, Music2, Timer)
- Produces: `export default function WorkoutTypeCard(props: WorkoutTypeCardProps)`

```typescript
interface WorkoutTypeCardProps {
  id: string
  name: string
  icon: string
  onStart: (id: string) => void
}
```

- [ ] **Criar `src/components/workout/WorkoutTypeCard.tsx`:**

```tsx
'use client'

import { motion } from 'framer-motion'
import { Play, Music2, Timer } from 'lucide-react'

interface WorkoutTypeCardProps {
  id: string
  name: string
  icon: string
  onStart: (id: string) => void
}

export default function WorkoutTypeCard({ id, name, icon, onStart }: WorkoutTypeCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="rounded-[20px] p-5"
      style={{ background: 'var(--workout-bg)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-5xl">{icon}</span>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onStart(id)}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--workout-icon)' }}
        >
          <Play size={18} color="#000" fill="#000" />
        </motion.button>
      </div>

      <p
        className="mt-3 text-lg font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {name}
      </p>

      <div className="flex gap-3 mt-3">
        {[
          { Icon: Music2, label: 'Música' },
          { Icon: Timer,  label: 'Tempo'  },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Icon size={16} color="var(--workout-icon)" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`

---

### Task 9: home/page.tsx — Tela home completa estilo Apple Fitness

**Files:**
- Modify: `src/app/(app)/home/page.tsx`

**Interfaces:**
- Consumes:
  - `@/hooks/useAuth` → `useAuth()` retorna `{ user, profile }`
  - `@/hooks/useFeed` → `useFeed()` retorna `{ items, loading, hasMore, fetchFriendsFeed, loadMore, fetchDaySummary, toggleKudos }`
  - `@/types/app.types` → `DaySummary`
  - `@/lib/utils` → `formatDate(date, format): string`
  - `@/components/layout/PageHeader` → `PageHeader({ title, subtitle, avatarName, avatarUri })`
  - `@/components/ui/ActivityRing` → `ActivityRing({ rings, size })`
  - `@/components/ui/MetricCard` → `MetricCard({ title, subtitle, value, unit, color, data, href })`
  - `@/components/ui/Skeleton` → `Skeleton({ className })`
  - `@/components/feed/ActivityCard` → `ActivityCard({ item, onKudos })`
  - `@/lib/animations` → `staggerContainer`, `cardEntrance`
  - `METRIC_COLORS` de `@/constants/theme`

- [ ] **Substituir `src/app/(app)/home/page.tsx`:**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useFeed } from '@/hooks/useFeed'
import PageHeader from '@/components/layout/PageHeader'
import ActivityRing from '@/components/ui/ActivityRing'
import MetricCard from '@/components/ui/MetricCard'
import Skeleton from '@/components/ui/Skeleton'
import ActivityCard from '@/components/feed/ActivityCard'
import { formatDate } from '@/lib/utils'
import { staggerContainer, cardEntrance } from '@/lib/animations'
import { METRIC_COLORS } from '@/constants/theme'
import type { DaySummary } from '@/types/app.types'

function buildBarData(value: number, max: number): number[] {
  const slots = 24
  const filledSlots = Math.round((value / Math.max(max, 1)) * slots)
  return Array.from({ length: slots }, (_, i) => {
    if (i >= slots - filledSlots) return Math.random() * 0.6 + 0.4
    return Math.random() * 0.2
  }).map((v) => Math.round(v * max))
}

export default function HomePage() {
  const { user, profile } = useAuth()
  const { items, loading, hasMore, fetchFriendsFeed, loadMore, fetchDaySummary, toggleKudos } =
    useFeed()
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    if (!user) return
    fetchFriendsFeed(user.id)
    setSummaryLoading(true)
    fetchDaySummary(user.id, today).then((s) => {
      setSummary(s)
      setSummaryLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'você'
  const dayLabel    = formatDate(today, "EEEE, d 'de' MMM.")

  const habitsProgress  = summary ? (summary.habitsTotal > 0 ? summary.habitsCompleted / summary.habitsTotal : 0) : 0
  const workoutProgress = summary?.workoutDone ? 1 : 0
  const calorieProgress = summary ? Math.min((summary.caloriesConsumed ?? 0) / 2000, 1) : 0
  const sleepProgress   = summary ? Math.min((summary.sleepHours ?? 0) / 8, 1) : 0

  const rings = [
    { progress: calorieProgress,  color: METRIC_COLORS.move  },
    { progress: workoutProgress,  color: METRIC_COLORS.workout },
    { progress: habitsProgress,   color: METRIC_COLORS.dist  },
    { progress: sleepProgress,    color: METRIC_COLORS.sleep },
  ]

  const metricCards = [
    {
      title: 'Hábitos',
      subtitle: 'Hoje',
      value: `${summary?.habitsCompleted ?? 0}/${summary?.habitsTotal ?? 0}`,
      unit: '',
      color: METRIC_COLORS.steps,
      data: buildBarData(summary?.habitsCompleted ?? 0, summary?.habitsTotal ?? 1),
      href: '/habits',
    },
    {
      title: 'Distância',
      subtitle: 'Hoje',
      value: '0',
      unit: 'km',
      color: METRIC_COLORS.dist,
      data: buildBarData(0, 10),
      href: '/workout',
    },
    {
      title: 'Calorias',
      subtitle: 'Hoje',
      value: summary?.caloriesConsumed ?? 0,
      unit: 'kcal',
      color: METRIC_COLORS.move,
      data: buildBarData(summary?.caloriesConsumed ?? 0, 2000),
      href: '/nutrition',
    },
    {
      title: 'Sono',
      subtitle: 'Ontem',
      value: summary?.sleepHours ? summary.sleepHours.toFixed(1) : '--',
      unit: 'h',
      color: METRIC_COLORS.sleep,
      data: buildBarData((summary?.sleepHours ?? 0) * 60, 480),
      href: '/sleep',
    },
  ]

  return (
    <div className="pb-28">
      <PageHeader
        title="Resumo"
        subtitle={dayLabel}
        avatarName={displayName}
        avatarUri={profile?.avatar_url}
      />

      <div className="px-4 space-y-4 mt-2">
        {/* Anel de Atividade */}
        {summaryLoading ? (
          <Skeleton className="h-40 w-full rounded-[20px]" />
        ) : (
          <motion.div
            variants={cardEntrance}
            initial="initial"
            animate="animate"
            className="rounded-[20px] p-5"
            style={{ background: 'var(--surface)' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Círculo de Atividade
            </p>
            <div className="flex items-center gap-5">
              <ActivityRing rings={rings} size={110} />
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: 'Movimento',  value: `${summary?.caloriesConsumed ?? 0}/2000`, unit: 'CAL', color: METRIC_COLORS.move },
                  { label: 'Treino',     value: workoutProgress > 0 ? 'Feito' : 'Pendente', unit: '',    color: METRIC_COLORS.workout },
                  { label: 'Hábitos',    value: `${summary?.habitsCompleted ?? 0}/${summary?.habitsTotal ?? 0}`, unit: '',    color: METRIC_COLORS.dist },
                  { label: 'Sono',       value: summary?.sleepHours ? `${summary.sleepHours.toFixed(1)}h` : '--', unit: '',    color: METRIC_COLORS.sleep },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                    <p className="font-mono font-bold text-base" style={{ color: m.color }}>
                      {m.value}{m.unit && <span className="text-xs ml-0.5">{m.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid 2×2 de MetricCards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-[20px]" />)}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </motion.div>
        )}

        {/* Feed */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="title-section">Atividade Recente</h2>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-[20px]" />
            <Skeleton className="h-24 w-full rounded-[20px]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="text-4xl mb-3">🌱</span>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhuma atividade ainda.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Comece um treino ou complete um hábito!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                onKudos={() => user && toggleKudos(item.id, user.id)}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => user && loadMore(user.id)}
                disabled={loading}
                className="w-full py-3 text-sm disabled:opacity-50"
                style={{ color: 'var(--primary)' }}
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Verificar TypeScript:** `npx tsc --noEmit`
- [ ] **Verificar build:** `npm run build`

---

## Checklist Visual Final

Após todas as tasks:

- [ ] Fundo preto puro (`#000`) em todas as telas
- [ ] Tab bar em formato de pílula flutuante com blur
- [ ] Cards em cinza escuro iOS (`#1C1C1E`) com radius 20px
- [ ] Cada métrica com sua cor própria
- [ ] Anel de atividade animado com glow colorido
- [ ] Valores numéricos em fonte mono
- [ ] Mini gráficos de barras nos MetricCards
- [ ] Cards de treino com fundo verde escuro e ícone verde lima
- [ ] Animações suaves de entrada nos cards
