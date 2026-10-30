import { MessageSquareText, PlusCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { DoubtCard } from '@/components/campus/DoubtCard'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCampus } from '@/context/CampusContext'
import { canAskDoubts } from '@/lib/permissions'
import type { Doubt } from '@/types/campus'

export default function MyDoubtsPage() {
  const navigate = useNavigate()
  const { currentUser, doubts, updateDoubt } = useCampus()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All My Doubts')
  const [editing, setEditing] = useState<Doubt | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const mine = useMemo(() => {
    return doubts
      .filter((doubt) => doubt.authorId === currentUser?.id)
      .filter((doubt) => {
        if (filter === 'Unanswered') return doubt.status === 'Unanswered'
        if (filter === 'Answered') return doubt.status === 'Answered'
        return true
      })
      .filter((doubt) => [doubt.title, doubt.description].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [doubts, currentUser, query, filter])

  const openEdit = (doubt: Doubt) => {
    setEditing(doubt)
    setTitle(doubt.title)
    setDescription(doubt.description)
  }

  const save = () => {
    if (!editing) return
    if (title.trim().length < 8 || description.trim().length < 30) {
      toast.error('Keep a clear title and a description of at least 30 characters')
      return
    }
    updateDoubt(editing.id, {
      title: title.trim(),
      description: description.trim(),
      noticeId: editing.noticeId,
      department: editing.department,
      attachments: editing.attachments,
    })
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="My Doubts"
        description="Track every question you have submitted, edit unanswered doubts, and review official responses."
        actions={canAskDoubts(currentUser) ? (
          <Button onClick={() => navigate('/doubts/ask')} className="rounded-full">
            <PlusCircle className="size-4" aria-hidden="true" /> Ask a Doubt
          </Button>
        ) : null}
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your doubts…" className="h-11 pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-11">
            {['All My Doubts', 'Unanswered', 'Answered'].map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {mine.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {mine.map((doubt) => <DoubtCard key={doubt.id} doubt={doubt} onEdit={openEdit} />)}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="No doubts in this view"
          description="Questions you submit will appear here with their response status and related notice."
          actionLabel={canAskDoubts(currentUser) ? 'Ask a Doubt' : undefined}
          onAction={canAskDoubts(currentUser) ? () => navigate('/doubts/ask') : undefined}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit unanswered doubt</DialogTitle>
            <DialogDescription>Your question can be edited only until an official response is posted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="my-doubt-title">Question title</Label>
              <Input id="my-doubt-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="my-doubt-description">Description</Label>
              <Textarea id="my-doubt-description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-36" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
