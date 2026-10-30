import { Megaphone, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/campus/EmptyState'
import { NoticeCard } from '@/components/campus/NoticeCard'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categories, departments } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'

export default function NoticeBoardPage() {
  const { notices, currentUser } = useCampus()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [category, setCategory] = useState('All')
  const [department, setDepartment] = useState('All Departments')
  const [dateRange, setDateRange] = useState('All time')
  const [visible, setVisible] = useState(6)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const now = new Date()
    return notices
      .filter((notice) => notice.status === 'Published')
      .filter((notice) => {
        if (currentUser?.role === 'Student') {
          return notice.audience.includes('All Campus') || notice.audience.includes('Students') || notice.audience.includes('Final Year') || notice.audience.includes('First Year')
        }
        return true
      })
      .filter((notice) => (category === 'All' ? true : notice.category === category))
      .filter((notice) => (department === 'All Departments' ? true : notice.department === department || notice.department === 'All Departments'))
      .filter((notice) => {
        if (dateRange === 'All time') return true
        const date = new Date(notice.publishAt)
        const diff = now.getTime() - date.getTime()
        if (dateRange === 'Today') return diff >= 0 && diff <= 86400000
        if (dateRange === 'This week') return diff >= 0 && diff <= 7 * 86400000
        if (dateRange === 'This month') return diff >= 0 && diff <= 31 * 86400000
        return true
      })
      .filter((notice) => {
        if (!normalized) return true
        return [notice.title, notice.description, notice.category, notice.department]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime())
  }, [notices, query, category, department, dateRange, currentUser])

  const pinned = filtered.filter((notice) => notice.pinned)
  const regular = filtered.filter((notice) => !notice.pinned)
  const shown = [...pinned, ...regular].slice(0, visible)

  const resetFilters = () => {
    setCategory('All')
    setDepartment('All Departments')
    setDateRange('All time')
    setSearchParams({})
    setVisible(6)
  }

  return (
    <div>
      <PageHeader
        title="Campus Notice Board"
        description="Search official notices, filter by category and department, and open attachments or details from one place."
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_210px_160px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})}
              placeholder="Search notice title, content, category…"
              className="h-11 pl-9"
              aria-label="Search notices"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              {['All time', 'Today', 'This week', 'This month'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11" onClick={resetFilters}>
            <RotateCcw className="size-4" aria-hidden="true" /> Reset
          </Button>
        </div>
      </div>

      {pinned.length ? (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Pinned notices</h2>
            <span className="text-sm text-slate-500">{pinned.length} item{pinned.length === 1 ? '' : 's'}</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {pinned.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Recent notices</h2>
          <span className="text-sm text-slate-500">{regular.length} result{regular.length === 1 ? '' : 's'}</span>
        </div>
        {filtered.length ? (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              {shown.filter((notice) => !notice.pinned).map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
            </div>
            {visible < filtered.length ? (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => setVisible((count) => count + 4)}>Load more notices</Button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No notices match your filters"
            description="Try clearing the search or selecting a broader category, department, or date range."
            actionLabel="Reset filters"
            onAction={resetFilters}
          />
        )}
      </section>
    </div>
  )
}
