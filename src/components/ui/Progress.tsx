import { cn } from '@/lib/utils'
import { getPercentageBgColor } from '@/lib/data'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, className, showLabel = false }: ProgressProps) {
  const percentage = Math.round((value / max) * 100)
  const colorClass = getPercentageBgColor(percentage)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
          {percentage}%
        </span>
      )}
    </div>
  )
}
