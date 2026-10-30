import { Archive, CalendarClock, Edit3, FileText, MoreHorizontal, Pin, PinOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCampus } from '@/context/CampusContext'
import { formatDate, formatDateTime } from '@/lib/format'
import { canDeleteNotice, canManageOwnNotice } from '@/lib/permissions'
import type { Notice } from '@/types/campus'
import { CategoryBadge, PriorityBadge, StatusBadge } from './Badges'

export function NoticeCard({ notice }: { notice: Notice }) {
  const navigate = useNavigate()
  const { currentUser, users, togglePinNotice, archiveNotice, deleteNotice } = useCampus()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const author = users.find((user) => user.id === notice.authorId)
  const manageable = canManageOwnNotice(currentUser, notice)
  const deletable = canDeleteNotice(currentUser, notice)
  const hasActions = manageable || deletable

  return (
    <Card className="group border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge label={notice.category} />
            <PriorityBadge priority={notice.priority} />
            {notice.status !== 'Published' ? <StatusBadge status={notice.status} /> : null}
            {notice.pinned ? (
              <Badge className="bg-[#153E75] text-white hover:bg-[#153E75]">
                <Pin className="size-3" aria-hidden="true" /> Pinned
              </Badge>
            ) : null}
          </div>
          {hasActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${notice.title}`}>
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => navigate(`/notices/${notice.id}`)}>
                  Open notice
                </DropdownMenuItem>
                {manageable ? (
                  <DropdownMenuItem onSelect={() => navigate(`/notices/${notice.id}/edit`)}>
                    <Edit3 className="size-4" aria-hidden="true" /> Edit
                  </DropdownMenuItem>
                ) : null}
                {manageable ? (
                  <DropdownMenuItem onSelect={() => togglePinNotice(notice.id)}>
                    {notice.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
                    {notice.pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                ) : null}
                {manageable && notice.status !== 'Archived' ? (
                  <DropdownMenuItem onSelect={() => archiveNotice(notice.id)}>
                    <Archive className="size-4" aria-hidden="true" /> Archive
                  </DropdownMenuItem>
                ) : null}
                {deletable ? <DropdownMenuSeparator /> : null}
                {deletable ? (
                  <DropdownMenuItem variant="destructive" onSelect={(event) => {
                    event.preventDefault()
                    setDeleteOpen(true)
                  }}>
                    <Trash2 className="size-4" aria-hidden="true" /> Delete
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <Link to={`/notices/${notice.id}`} className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]">
          <h3 className="text-lg font-semibold leading-7 text-slate-950 group-hover:text-[#2563EB]">
            {notice.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{notice.description}</p>
        </Link>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium text-slate-700">{author?.name ?? 'Unknown author'}</span>
            <span>{author?.role}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {notice.status === 'Scheduled' ? formatDateTime(notice.publishAt) : formatDate(notice.publishAt)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {notice.attachments.length ? (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <FileText className="size-3.5" aria-hidden="true" /> {notice.attachments.length} attachment
                {notice.attachments.length > 1 ? 's' : ''}
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => navigate(`/notices/${notice.id}`)}>
              Open
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>
              “{notice.title}” will be permanently removed from the campus notice board. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteNotice(notice.id)}>
              Delete notice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
