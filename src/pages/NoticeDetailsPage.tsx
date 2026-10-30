import { Archive, ArrowLeft, CalendarDays, Edit3, FileText, MessageCircleQuestion, Pin, PinOff, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AttachmentList } from '@/components/campus/AttachmentList'
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/components/campus/Badges'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCampus } from '@/context/CampusContext'
import { formatDate, formatDateTime, initials } from '@/lib/format'
import { canAskDoubts, canDeleteNotice, canManageOwnNotice } from '@/lib/permissions'

export default function NoticeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, users, notices, togglePinNotice, archiveNotice, deleteNotice } = useCampus()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const notice = notices.find((item) => item.id === id)

  if (!notice) {
    return (
      <EmptyState
        icon={FileText}
        title="Notice not found"
        description="The notice may have been deleted or the link may be incorrect."
        actionLabel="Back to Notice Board"
        onAction={() => navigate('/notices')}
      />
    )
  }

  if (currentUser?.role === 'Student' && notice.status !== 'Published') {
    return (
      <EmptyState
        icon={FileText}
        title="Access denied"
        description="Students can only view published notices. Scheduled, draft, and archived content is restricted."
        actionLabel="Back to Notice Board"
        onAction={() => navigate('/notices')}
      />
    )
  }

  const author = users.find((user) => user.id === notice.authorId)
  const manageable = canManageOwnNotice(currentUser, notice)
  const deletable = canDeleteNotice(currentUser, notice)
  const related = notices
    .filter((item) => item.id !== notice.id && item.category === notice.category && item.status === 'Published')
    .slice(0, 3)

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/notices')}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Notice Board
      </Button>

      <PageHeader
        title={notice.title}
        description="Official campus communication with attachments, audience details, and linked questions."
        actions={
          <div className="flex flex-wrap gap-2">
            {canAskDoubts(currentUser) ? (
              <Button variant="outline" onClick={() => navigate(`/doubts/ask?notice=${notice.id}`)}>
                <MessageCircleQuestion className="size-4" aria-hidden="true" /> Ask a doubt
              </Button>
            ) : null}
            {manageable ? (
              <Button variant="outline" onClick={() => navigate(`/notices/${notice.id}/edit`)}>
                <Edit3 className="size-4" aria-hidden="true" /> Edit
              </Button>
            ) : null}
            {manageable ? (
              <Button variant="outline" onClick={() => togglePinNotice(notice.id)}>
                {notice.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
                {notice.pinned ? 'Unpin' : 'Pin'}
              </Button>
            ) : null}
            {manageable && notice.status !== 'Archived' ? (
              <Button variant="outline" onClick={() => archiveNotice(notice.id)}>
                <Archive className="size-4" aria-hidden="true" /> Archive
              </Button>
            ) : null}
            {deletable ? (
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" aria-hidden="true" /> Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge label={notice.category} />
              <PriorityBadge priority={notice.priority} />
              <StatusBadge status={notice.status} />
              {notice.pinned ? <CategoryBadge label="Pinned announcement" className="border-blue-200 bg-blue-50 text-blue-700" /> : null}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-[#153E75] text-white">{initials(author?.name ?? 'Unknown')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{author?.name ?? 'Unknown author'}</p>
                  <p className="text-sm text-slate-500">{author?.role} · {author?.department}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" aria-hidden="true" /> Published {formatDateTime(notice.publishAt)}</span>
                <span className="inline-flex items-center gap-2"><UserRound className="size-4" aria-hidden="true" /> {notice.audience.join(', ')}</span>
              </div>
            </div>

            <Separator className="my-6" />
            <article className="max-w-none text-base leading-8 text-slate-700">
              {notice.description.split('\n').map((paragraph) => <p key={paragraph} className="mb-4">{paragraph}</p>)}
            </article>

            {notice.attachments.length ? (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-slate-950">Attachments</h2>
                <AttachmentList attachments={notice.attachments} contextTitle={notice.title} />
              </section>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Notice metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500">Department</span><span className="font-medium text-slate-900">{notice.department}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Audience</span><span className="text-right font-medium text-slate-900">{notice.audience.join(', ')}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Created</span><span className="font-medium text-slate-900">{formatDate(notice.createdAt)}</span></div>
              {notice.updatedAt ? <div className="flex justify-between gap-4"><span className="text-slate-500">Updated</span><span className="font-medium text-slate-900">{formatDate(notice.updatedAt)}</span></div> : null}
              {notice.archivedAt ? <div className="flex justify-between gap-4"><span className="text-slate-500">Archived</span><span className="font-medium text-slate-900">{formatDate(notice.archivedAt)}</span></div> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Related notices</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {related.map((item) => (
                <Link key={item.id} to={`/notices/${item.id}`} className="block rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.category} · {formatDate(item.publishAt)}</p>
                </Link>
              ))}
              {related.length === 0 ? <p className="text-sm text-slate-500">No related published notices.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>
              “{notice.title}” will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              deleteNotice(notice.id)
              navigate('/notices')
            }}>
              Delete notice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
