import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'navy' | 'blue' | 'amber' | 'green' | 'slate'
  detail?: string
}

const tones = {
  navy: 'bg-[#153E75] text-white',
  blue: 'bg-[#EAF2FF] text-[#2563EB]',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

export function StatCard({ label, value, icon: Icon, tone = 'blue', detail }: StatCardProps) {
  const dark = tone === 'navy'
  return (
    <Card className={cn('border-slate-200 shadow-sm', dark && 'border-[#153E75] bg-[#153E75] text-white')}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className={cn('text-sm font-medium', dark ? 'text-blue-100' : 'text-slate-500')}>{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {detail ? <p className={cn('mt-2 text-xs', dark ? 'text-blue-100' : 'text-slate-500')}>{detail}</p> : null}
        </div>
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}
