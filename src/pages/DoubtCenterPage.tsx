import { MessageCircleQuestion, PlusCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { DoubtCard } from '@/components/campus/DoubtCard'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { departments } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { canAskDoubts } from '@/lib/permissions'

export default function DoubtCenterPage() {
  const navigate = useNavigate()
  const { currentUser, doubts, notices } = useCampus()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All Departments')
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    return doubts
      .filter((doubt) => {
        if (filter === 'Unanswered') return doubt.status === 'Unanswered'
        if (filter === 'Answered') return doubt.status === 'Answered'
        if (filter === 'Recent') return Date.now() - new Date(doubt.createdAt).getTime() <= 7 * 86400000
        return true
      })
      .filter((doubt) => department === 'All Departments' || doubt.department === department)
      .filter((doubt) => {
        const notice = notices.find((item) => item.id === doubt.noticeId)
        return [doubt.title, doubt.description, doubt.department, notice?.title ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [doubts, notices, query, department, filter])

  return (
    <div>
      <PageHeader
        title="Doubt Center"
        description="Search questions connected to official notices, track response status, and answer the questions your role owns."
        actions={canAskDoubts(currentUser) ? (
          <Button onClick={() => navigate('/doubts/ask')} className="rounded-full">
            <PlusCircle className="size-4" aria-hidden="true" /> Ask a Doubt
          </Button>
        ) : null}
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions or related notices…" className="h-11 pl-9" />
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>{departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-11">
              {['All', 'Unanswered', 'Answered', 'Recent'].map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((doubt) => <DoubtCard key={doubt.id} doubt={doubt} />)}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircleQuestion}
          title="No questions found"
          description="Try another filter, or ask a new doubt connected to a published notice."
          actionLabel={canAskDoubts(currentUser) ? 'Ask a Doubt' : undefined}
          onAction={canAskDoubts(currentUser) ? () => navigate('/doubts/ask') : undefined}
        />
      )}
    </div>
  )
}
