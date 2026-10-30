import { CalendarClock, Edit3, RotateCcw, Search, Trash2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/campus/Badges'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { categories } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { formatDateTime, fromDateTimeLocal, toDateTimeLocal } from '@/lib/format'
import { canDeleteNotice, canManageOwnNotice, canViewStaffTools } from '@/lib/permissions'
import type { Notice } from '@/types/campus'

export default function ScheduledNoticesPage() {
  const navigate = useNavigate()
  const { currentUser, users, notices, updateNotice, cancelSchedule, deleteNotice } = useCampus()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [editing, setEditing] = useState<Notice | null>(null)
  const [scheduleAt, setScheduleAt] = useState('')
  const [deleting, setDeleting] = useState<Notice | null>(null)

  const scheduled = useMemo(() => {
    if (!currentUser || !canViewStaffTools(currentUser)) return []
    return notices
      .filter((notice) => notice.status === 'Scheduled')
      .filter((notice) => currentUser.role === 'Admin' || notice.authorId === currentUser.id)
      .filter((notice) => category === 'All' || notice.category === category)
      .filter((notice) => [notice.title, notice.department, notice.category].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime())
  }, [notices, currentUser, query, category])

  if (!canViewStaffTools(currentUser)) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Access denied"
        description="Students cannot view unpublished scheduled notices. Switch to Admin, Faculty, or Office Staff to manage schedules."
        actionLabel="Open Notice Board"
        onAction={() => navigate('/notices')}
      />
    )
  }

  const saveSchedule = () => {
    if (!editing) return
    if (!scheduleAt || new Date(scheduleAt).getTime() <= Date.now()) {
      toast.error('Choose a future publication date and time')
      return
    }
    updateNotice(editing.id, {
      title: editing.title,
      description: editing.description,
      category: editing.category,
      priority: editing.priority,
      audience: editing.audience,
      department: editing.department,
      publishAt: fromDateTimeLocal(scheduleAt),
      attachments: editing.attachments,
    }, 'Scheduled')
    setEditing(null)
    toast.success('Schedule updated')
  }

  return (
    <div>
      <PageHeader
        title="Scheduled Notices"
        description="Review upcoming publication times, edit schedules, cancel scheduled posts, or open notices for revision."
        actions={<Button onClick={() => navigate('/notices/new')}><CalendarClock className="size-4" aria-hidden="true" /> Schedule a notice</Button>}
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search scheduled notices…" className="h-11 pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {scheduled.length ? (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Notice title</TableHead>
                    <TableHead>Scheduled for</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduled.map((notice) => {
                    const author = users.find((user) => user.id === notice.authorId)
                    const manageable = canManageOwnNotice(currentUser, notice)
                    const deletable = canDeleteNotice(currentUser, notice)
                    return (
                      <TableRow key={notice.id}>
                        <TableCell className="min-w-64">
                          <button type="button" className="font-semibold text-slate-900 hover:text-[#2563EB]" onClick={() => navigate(`/notices/${notice.id}`)}>
                            {notice.title}
                          </button>
                          <p className="mt-1 text-xs text-slate-500">{notice.department}</p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDateTime(notice.publishAt)}</TableCell>
                        <TableCell>{author?.name}</TableCell>
                        <TableCell>{notice.category}</TableCell>
                        <TableCell><StatusBadge status={notice.status} /></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {manageable ? (
                              <Button variant="outline" size="sm" onClick={() => {
                                setEditing(notice)
                                setScheduleAt(toDateTimeLocal(notice.publishAt))
                              }}>
                                <CalendarClock className="size-4" aria-hidden="true" /> Edit schedule
                              </Button>
                            ) : null}
                            {manageable ? (
                              <Button variant="outline" size="sm" onClick={() => navigate(`/notices/${notice.id}/edit`)}>
                                <Edit3 className="size-4" aria-hidden="true" /> Edit notice
                              </Button>
                            ) : null}
                            {manageable ? (
                              <Button variant="outline" size="sm" onClick={() => cancelSchedule(notice.id)}>
                                <XCircle className="size-4" aria-hidden="true" /> Cancel schedule
                              </Button>
                            ) : null}
                            {deletable ? (
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleting(notice)}>
                                <Trash2 className="size-4" aria-hidden="true" /> Delete
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="No scheduled notices"
          description="When a notice is scheduled for future publication, it will appear here with edit and cancellation actions."
          actionLabel="Create notice"
          onAction={() => navigate('/notices/new')}
        />
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit publication schedule</DialogTitle>
            <DialogDescription>{editing?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-schedule">Publication date and time</Label>
            <Input id="edit-schedule" type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}><RotateCcw className="size-4" aria-hidden="true" /> Cancel</Button>
            <Button onClick={saveSchedule}>Save schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scheduled notice?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be permanently deleted instead of being published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              if (deleting) deleteNotice(deleting.id)
              setDeleting(null)
            }}>
              Delete notice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
