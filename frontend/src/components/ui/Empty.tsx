import { cn } from '@/lib/utils'
import { FileX } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function Empty({ title, description, icon, action, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <FileX className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
