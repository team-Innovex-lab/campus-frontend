import { MessageSquareText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/campus/Badges'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCampus } from '@/context/CampusContext'
import { formatDateTime } from '@/lib/format'

export default function MyResponsesPage() {
  const { currentUser, doubts, notices } = useCampus()
  const [query, setQuery] = useState('')

  const responses = useMemo(() => {
    return doubts
      .flatMap((doubt) => doubt.responses
        .filter((response) => response.authorId === currentUser?.id)
        .map((response) => ({ doubt, response, notice: notices.find((notice) => notice.id === doubt.noticeId) })))
      .filter(({ doubt, response }) => [doubt.title, response.body].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.response.createdAt).getTime() - new Date(a.response.createdAt).getTime())
  }, [doubts, notices, currentUser, query])

  return (
    <div>
      <PageHeader
        title="My Responses"
        description="Review every official response you have posted and reopen the linked discussion when follow-up is needed."
      />
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your responses…" className="h-11 pl-9" />
        </div>
      </div>

      {responses.length ? (
        <div className="space-y-4">
          {responses.map(({ doubt, response, notice }) => (
            <Card key={response.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link to={`/doubts/${doubt.id}`} className="font-semibold text-slate-950 hover:text-[#2563EB]">
                      {doubt.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {notice?.title ?? 'Linked notice unavailable'} · {formatDateTime(response.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={doubt.status} />
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{response.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="No responses yet"
          description="When you respond to a permitted doubt, your response history will appear here."
        />
      )}
    </div>
  )
}
