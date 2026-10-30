import { Bell, CheckCheck, Megaphone, MessageCircleQuestion, Settings2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCampus } from '@/context/CampusContext'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const icons = {
  notice: Megaphone,
  doubt: MessageCircleQuestion,
  system: Settings2,
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCampus()
  const [filter, setFilter] = useState('All')
  const filtered = useMemo(() => notifications.filter((item) => filter === 'All' || (filter === 'Unread' ? item.unread : !item.unread)), [notifications, filter])

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Track new notices, important announcements, doubt responses, and publication updates."
        actions={<Button variant="outline" onClick={markAllNotificationsRead}><CheckCheck className="size-4" aria-hidden="true" /> Mark all read</Button>}
      />
      <div className="mb-6 flex justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {['All', 'Unread', 'Read'].map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const Icon = icons[notification.type]
            return (
              <button
                type="button"
                key={notification.id}
                onClick={() => {
                  markNotificationRead(notification.id)
                  navigate(notification.link)
                }}
                className={cn(
                  'w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#2563EB]/40 hover:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
                  notification.unread ? 'border-[#2563EB]/30' : 'border-slate-200',
                )}
              >
                <div className="flex gap-4">
                  <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', notification.unread ? 'bg-[#EAF2FF] text-[#2563EB]' : 'bg-slate-100 text-slate-500')}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-950">{notification.title}</p>
                      {notification.unread ? <span className="mt-1 size-2 shrink-0 rounded-full bg-[#2563EB]" /> : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={Bell} title="No notifications" description="Notifications about notices and doubt responses will appear here." />
      )}
    </div>
  )
}
