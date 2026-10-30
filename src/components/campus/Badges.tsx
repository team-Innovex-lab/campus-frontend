import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DoubtStatus, NoticeStatus, Priority, Role } from '@/types/campus'

export function StatusBadge({ status, className }: { status: NoticeStatus | DoubtStatus; className?: string }) {
  const styles: Record<string, string> = {
    Published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
    Draft: 'border-slate-200 bg-slate-100 text-slate-700',
    Archived: 'border-stone-200 bg-stone-100 text-stone-600',
    Answered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Unanswered: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  return (
    <Badge variant="outline" className={cn('font-semibold', styles[status], className)}>
      {status}
    </Badge>
  )
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const styles: Record<Priority, string> = {
    Normal: 'border-slate-200 bg-slate-50 text-slate-700',
    Important: 'border-blue-200 bg-blue-50 text-blue-700',
    Urgent: 'border-red-200 bg-red-50 text-red-700',
  }
  return (
    <Badge variant="outline" className={cn('font-semibold', styles[priority], className)}>
      {priority}
    </Badge>
  )
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const styles: Record<Role, string> = {
    Admin: 'border-[#153E75]/20 bg-[#153E75] text-white',
    Faculty: 'border-blue-200 bg-blue-50 text-blue-700',
    'Office Staff': 'border-cyan-200 bg-cyan-50 text-cyan-800',
    Student: 'border-violet-200 bg-violet-50 text-violet-700',
  }
  return (
    <Badge variant="outline" className={cn('font-semibold', styles[role], className)}>
      {role}
    </Badge>
  )
}

export function CategoryBadge({ label, className }: { label: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border-slate-200 bg-slate-50 font-medium text-slate-600', className)}>
      {label}
    </Badge>
  )
}
