# PULSYNC

PWA de saúde e hábitos para casais — Lucas & Isa.

Stack: Next.js 14 · Supabase · Tailwind CSS v4 · Framer Motion · TypeScript strict

---

## Pré-requisitos

- Node.js ≥ 18
- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita no [Vercel](https://vercel.com) (deploy)

---

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com as chaves do seu projeto Supabase (Settings → API):

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |

### 3. Banco de dados

No Supabase Dashboard → **SQL Editor**, execute o arquivo completo:

```
database/schema.sql
```

Isso cria todas as tabelas, índices, RLS policies, triggers e conquistas iniciais.

### 4. Storage bucket

O script SQL já cria o bucket `avatars`. Se precisar fazer manualmente:

- Supabase Dashboard → **Storage** → **New Bucket**
- Nome: `avatars`
- Public: ✓

### 5. Gerar ícones PWA

```bash
npm run generate-icons
```

Gera `public/icons/icon-{72,96,128,144,192,512}.png` a partir do SVG da marca.

### 6. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Deploy no Vercel

### Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Via Dashboard

1. Push para um repositório GitHub
2. Importe o repositório em [vercel.com/new](https://vercel.com/new)
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

O `vercel.json` na raiz já configura o framework corretamente.

---

## Instalar como PWA

### Android (Chrome)
O app exibe um banner automático "Instalar Pulsync". Toque em **Instalar**.

### iPhone / iPad (Safari)
1. Abra o app no Safari
2. Toque no ícone de Compartilhar ⬆️
3. Selecione **"Adicionar à Tela de Início"**

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/          # login, register
│   └── (app)/           # home, habits, workout, nutrition, sleep,
│                        # challenges, achievements, profile
├── components/
│   ├── ui/              # Button, Card, Avatar, Badge, ProgressBar…
│   ├── layout/          # Header, BottomNav, PageContainer
│   ├── feed/            # ActivityCard, KudosButton
│   ├── habits/          # HabitCard, WeekProgress
│   ├── workout/         # WorkoutTimer, MetricDisplay, WorkoutCard
│   ├── nutrition/       # CalorieRing, MacroBar
│   ├── sleep/           # SleepArc, PhaseBar
│   ├── challenges/      # ChallengeCard, DuelProgress
│   ├── gamification/    # XPBar, AchievementBadge, RankCard, AchievementModal
│   └── profile/         # StatsGrid, ActivityGraph
├── hooks/               # useAuth, useHabits, useWorkout, useNutrition,
│                        # useSleep, useChallenges, useAchievements, useProfile, useFeed
├── lib/
│   ├── supabase/        # client.ts, server.ts
│   └── utils.ts
├── store/               # authStore (Zustand)
├── types/               # database.types.ts, app.types.ts
└── constants/           # theme.ts, gamification.ts
database/
└── schema.sql           # Schema completo do Supabase
public/
├── icons/               # PWA icons (gerados por npm run generate-icons)
├── manifest.json        # Web App Manifest
└── sw.js                # Service Worker (gerado pelo next-pwa)
```

---

## Módulos implementados

| # | Módulo | Status |
|---|---|---|
| 1 | Design System & UI base | ✅ |
| 2 | Auth (login / registro) | ✅ |
| 3 | Home & Feed social | ✅ |
| 4 | Hábitos | ✅ |
| 5 | Treinos (GPS + manual) | ✅ |
| 6 | Nutrição (OpenFoodFacts) | ✅ |
| 7 | Sono | ✅ |
| 8 | Desafios (Realtime) | ✅ |
| 9 | Conquistas & Gamificação | ✅ |
| 10 | Perfil & Configurações | ✅ |
| 11 | PWA + Deploy | ✅ |

---

## Licença

Privado — uso pessoal de Lucas & Isa.
