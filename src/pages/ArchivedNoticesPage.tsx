import { Archive, ArchiveRestore, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { categories } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { formatDate } from '@/lib/format'
import { canDeleteNotice, canManageOwnNotice, canViewStaffTools } from '@/lib/permissions'
import type { Notice } from '@/types/campus'

export default function ArchivedNoticesPage() {
  const navigate = useNavigate()
  const { currentUser, users, notices, restoreNotice, deleteNotice } = useCampus()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [deleting, setDeleting] = useState<Notice | null>(null)

  const archived = useMemo(() => {
    if (!currentUser || !canViewStaffTools(currentUser)) return []
    return notices
      .filter((notice) => notice.status === 'Archived')
      .filter((notice) => currentUser.role === 'Admin' || notice.authorId === currentUser.id)
      .filter((notice) => category === 'All' || notice.category === category)
      .filter((notice) => [notice.title, notice.description, notice.department].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.archivedAt ?? b.publishAt).getTime() - new Date(a.archivedAt ?? a.publishAt).getTime())
  }, [notices, currentUser, query, category])

  if (!canViewStaffTools(currentUser)) {
    return (
      <EmptyState
        icon={Archive}
        title="Access denied"
        description="Archived notices are available only to Admin, Faculty, and Office Staff roles."
        actionLabel="Open Notice Board"
        onAction={() => navigate('/notices')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Archived Notices"
        description="Find expired or archived communication, review its original content, and restore it when policy allows."
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search archived notices…" className="h-11 pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {archived.length ? (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Archived notice</TableHead>
                    <TableHead>Original publication</TableHead>
                    <TableHead>Archived date</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archived.map((notice) => {
                    const author = users.find((user) => user.id === notice.authorId)
                    return (
                      <TableRow key={notice.id}>
                        <TableCell className="min-w-72">
                          <button type="button" className="font-semibold text-slate-900 hover:text-[#2563EB]" onClick={() => navigate(`/notices/${notice.id}`)}>
                            {notice.title}
                          </button>
                          <p className="mt-1 text-xs text-slate-500">{notice.category} · {notice.department}</p>
                        </TableCell>
                        <TableCell>{formatDate(notice.publishAt)}</TableCell>
                        <TableCell>{notice.archivedAt ? formatDate(notice.archivedAt) : '—'}</TableCell>
                        <TableCell>{author?.name}</TableCell>
                        <TableCell><StatusBadge status={notice.status} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/notices/${notice.id}`)}>Details</Button>
                            {canManageOwnNotice(currentUser, notice) ? (
                              <Button variant="outline" size="sm" onClick={() => restoreNotice(notice.id)}>
                                <ArchiveRestore className="size-4" aria-hidden="true" /> Restore
                              </Button>
                            ) : null}
                            {canDeleteNotice(currentUser, notice) ? (
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
          icon={Archive}
          title="Archive is empty"
          description="Archived notices will appear here after they are removed from the live notice board."
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete archived notice?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be permanently deleted from the archive.
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
