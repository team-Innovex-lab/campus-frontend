import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  FilePlus2,
  HelpCircle,
  Megaphone,
  MessageCircleQuestion,
  Pin,
  PlusCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { RoleBadge, StatusBadge } from '@/components/campus/Badges'
import { EmptyState } from '@/components/campus/EmptyState'
import { NoticeCard } from '@/components/campus/NoticeCard'
import { PageHeader } from '@/components/campus/PageHeader'
import { StatCard } from '@/components/campus/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampus } from '@/context/CampusContext'
import { formatDate, formatDateTime } from '@/lib/format'
import { canAskDoubts, canPostNotices } from '@/lib/permissions'

function DashboardList({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser, users, notices, doubts, activities } = useCampus()
  if (!currentUser) return null

  const published = notices.filter((notice) => notice.status === 'Published')
  const scheduled = notices.filter((notice) => notice.status === 'Scheduled')
  const archived = notices.filter((notice) => notice.status === 'Archived')
  const mine = notices.filter((notice) => notice.authorId === currentUser.id)
  const myDoubts = doubts.filter((doubt) => doubt.authorId === currentUser.id)
  const unanswered = doubts.filter((doubt) => doubt.status === 'Unanswered')
  const relevantUnanswered = unanswered.filter((doubt) => {
    const notice = notices.find((item) => item.id === doubt.noticeId)
    return currentUser.role === 'Admin' || notice?.authorId === currentUser.id
  })
  const pinned = published.filter((notice) => notice.pinned)
  const upcomingDeadlines = published
    .filter((notice) => notice.category === 'Deadlines' || notice.priority !== 'Normal')
    .slice(0, 4)

  const chartData = [
    { name: 'Published', value: published.length },
    { name: 'Scheduled', value: scheduled.length },
    { name: 'Archived', value: archived.length },
    { name: 'Open doubts', value: unanswered.length },
  ]

  const quickActions = [
    canPostNotices(currentUser)
      ? { label: 'Create notice', icon: FilePlus2, onClick: () => navigate('/notices/new') }
      : null,
    canAskDoubts(currentUser)
      ? { label: 'Ask a doubt', icon: PlusCircle, onClick: () => navigate('/doubts/ask') }
      : null,
    canPostNotices(currentUser)
      ? { label: 'Respond to doubts', icon: MessageCircleQuestion, onClick: () => navigate('/doubts') }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: typeof FilePlus2; onClick: () => void }>
  const primaryAction = quickActions[0]
  const PrimaryActionIcon = primaryAction?.icon

  return (
    <div>
      <PageHeader
        title={`${currentUser.role} Dashboard`}
        description={`Welcome back, ${currentUser.name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ')[0]}. Here is the current state of campus communication.`}
        actions={
          <div className="flex items-center gap-2">
            <RoleBadge role={currentUser.role} />
            {primaryAction && PrimaryActionIcon ? (
              <Button onClick={primaryAction.onClick} className="rounded-full">
                <PrimaryActionIcon className="size-4" aria-hidden="true" />
                {primaryAction.label}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currentUser.role === 'Admin' ? (
          <>
            <StatCard label="Total notices" value={notices.length} icon={Megaphone} tone="navy" detail="Across every department" />
            <StatCard label="Published" value={published.length} icon={BellRing} tone="green" detail="Visible to campus users" />
            <StatCard label="Scheduled" value={scheduled.length} icon={CalendarClock} tone="blue" detail="Awaiting publication" />
            <StatCard label="Unanswered doubts" value={unanswered.length} icon={HelpCircle} tone="amber" detail="Need staff attention" />
          </>
        ) : currentUser.role === 'Student' ? (
          <>
            <StatCard label="Recent notices" value={published.length} icon={Megaphone} tone="navy" detail="Published for your campus" />
            <StatCard label="Pinned announcements" value={pinned.length} icon={Pin} tone="blue" detail="High-priority items" />
            <StatCard label="My doubts" value={myDoubts.length} icon={MessageCircleQuestion} tone="slate" detail="Questions you asked" />
            <StatCard label="Answered" value={myDoubts.filter((doubt) => doubt.status === 'Answered').length} icon={CheckCircle2} tone="green" detail="Responses available" />
          </>
        ) : (
          <>
            <StatCard label="My notices" value={mine.length} icon={Megaphone} tone="navy" detail="Created by you" />
            <StatCard label="Published" value={mine.filter((notice) => notice.status === 'Published').length} icon={BellRing} tone="green" detail="Currently live" />
            <StatCard label="Scheduled" value={mine.filter((notice) => notice.status === 'Scheduled').length} icon={CalendarClock} tone="blue" detail="Your upcoming posts" />
            <StatCard label="Unanswered doubts" value={relevantUnanswered.length} icon={HelpCircle} tone="amber" detail="On your notices" />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          {currentUser.role === 'Admin' ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Campus communication overview</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : null}

          <DashboardList
            title={currentUser.role === 'Student' ? 'Pinned announcements' : 'Recently published notices'}
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>View board</Button>}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {(currentUser.role === 'Student' ? pinned : published).slice(0, 4).map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))}
            </div>
            {(currentUser.role === 'Student' ? pinned : published).length === 0 ? (
              <EmptyState icon={Megaphone} title="No notices available" description="New official notices will appear here as soon as they are published." />
            ) : null}
          </DashboardList>

          {currentUser.role !== 'Student' ? (
            <DashboardList
              title="Upcoming scheduled notices"
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/scheduled')}>Manage schedule</Button>}
            >
              <div className="space-y-3">
                {(currentUser.role === 'Admin' ? scheduled : scheduled.filter((notice) => notice.authorId === currentUser.id)).map((notice) => (
                  <div key={notice.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{notice.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatDateTime(notice.publishAt)} · {users.find((user) => user.id === notice.authorId)?.name}</p>
                    </div>
                    <StatusBadge status={notice.status} />
                  </div>
                ))}
                {(currentUser.role === 'Admin' ? scheduled : scheduled.filter((notice) => notice.authorId === currentUser.id)).length === 0 ? (
                  <EmptyState icon={CalendarClock} title="Nothing scheduled" description="Create a notice and choose Schedule Publication to fill this list." />
                ) : null}
              </div>
            </DashboardList>
          ) : (
            <DashboardList title="Important deadlines" action={<Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>All notices</Button>}>
              <div className="space-y-3">
                {upcomingDeadlines.map((notice) => (
                  <button
                    type="button"
                    key={notice.id}
                    onClick={() => navigate(`/notices/${notice.id}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{notice.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{notice.category} · Published {formatDate(notice.publishAt)}</p>
                    </div>
                    <Badge variant="outline">{notice.priority}</Badge>
                  </button>
                ))}
              </div>
            </DashboardList>
          )}
        </div>

        <div className="space-y-6">
          <DashboardList title="Quick actions">
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="justify-start rounded-xl" onClick={action.onClick}>
                  <action.icon className="size-4" aria-hidden="true" />
                  {action.label}
                </Button>
              ))}
              <Button variant="outline" className="justify-start rounded-xl" onClick={() => navigate('/notices')}>
                <Megaphone className="size-4" aria-hidden="true" /> Browse notice board
              </Button>
              <Button variant="outline" className="justify-start rounded-xl" onClick={() => navigate('/doubts')}>
                <MessageCircleQuestion className="size-4" aria-hidden="true" /> Open Doubt Center
              </Button>
            </div>
          </DashboardList>

          <DashboardList title="Recent activity">
            <div className="space-y-4">
              {activities.slice(0, 6).map((activity) => {
                const actor = users.find((user) => user.id === activity.actorId)
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-[#2563EB]" />
                    <div>
                      <p className="text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">{actor?.name ?? 'Campus user'}</span> {activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(activity.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </DashboardList>

          {currentUser.role !== 'Student' ? (
            <DashboardList title="Recent questions">
              <div className="space-y-3">
                {doubts.slice(0, 4).map((doubt) => (
                  <Link key={doubt.id} to={`/doubts/${doubt.id}`} className="block rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{doubt.title}</p>
                      <StatusBadge status={doubt.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{doubt.description}</p>
                  </Link>
                ))}
              </div>
            </DashboardList>
          ) : (
            <DashboardList title="My doubts" action={<Button variant="ghost" size="sm" onClick={() => navigate('/my-doubts')}>View all</Button>}>
              <div className="space-y-3">
                {myDoubts.slice(0, 4).map((doubt) => (
                  <Link key={doubt.id} to={`/doubts/${doubt.id}`} className="block rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{doubt.title}</p>
                      <StatusBadge status={doubt.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(doubt.createdAt)}</p>
                  </Link>
                ))}
                {myDoubts.length === 0 ? (
                  <EmptyState icon={MessageCircleQuestion} title="No doubts yet" description="Ask a question from any notice and track responses here." actionLabel="Ask a doubt" onAction={() => navigate('/doubts/ask')} />
                ) : null}
              </div>
            </DashboardList>
          )}
        </div>
      </div>
    </div>
  )
}
