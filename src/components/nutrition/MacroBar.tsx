import ProgressBar from '@/components/ui/ProgressBar'

type MacroType = 'protein' | 'carb' | 'fat'

interface MacroBarProps {
  consumed: number
  goal: number
  type: MacroType
}

const macroConfig: Record<MacroType, { label: string; emoji: string; color: string }> = {
  protein: { label: 'Proteína', emoji: '🥩', color: '#60A5FA' },
  carb: { label: 'Carboidrato', emoji: '🌾', color: '#FBBF24' },
  fat: { label: 'Gordura', emoji: '🥑', color: '#C084FC' },
}

export default function MacroBar({ consumed, goal, type }: MacroBarProps) {
  const cfg = macroConfig[type]
  return (
    <div className="flex items-center gap-3">
      <span className="text-base">{cfg.emoji}</span>
      <div className="flex-1">
        <ProgressBar progress={goal > 0 ? consumed / goal : 0} color={cfg.color} height={5} />
      </div>
      <span className="text-xs text-text-secondary shrink-0 w-20 text-right">
        {consumed}g / {goal}g
      </span>
    </div>
  )
}
