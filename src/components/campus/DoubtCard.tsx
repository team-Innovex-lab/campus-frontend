import { CalendarDays, Edit3, MessageSquare, MoreHorizontal, Paperclip, Trash2 } from 'lucide-react'
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
import { formatDate } from '@/lib/format'
import { canDeleteDoubt, canEditDoubt, canRespondToDoubt } from '@/lib/permissions'
import type { Doubt } from '@/types/campus'
import { CategoryBadge, StatusBadge } from './Badges'

export function DoubtCard({ doubt, onEdit }: { doubt: Doubt; onEdit?: (doubt: Doubt) => void }) {
  const navigate = useNavigate()
  const { currentUser, users, notices, deleteDoubt } = useCampus()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const author = users.find((user) => user.id === doubt.authorId)
  const notice = notices.find((item) => item.id === doubt.noticeId)
  const editable = canEditDoubt(currentUser, doubt)
  const deletable = canDeleteDoubt(currentUser, doubt)
  const respondable = canRespondToDoubt(currentUser, notice)

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={doubt.status} />
            <CategoryBadge label={doubt.department} />
            {notice ? <CategoryBadge label={notice.category} /> : null}
          </div>
          {editable || deletable ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${doubt.title}`}>
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => navigate(`/doubts/${doubt.id}`)}>Open question</DropdownMenuItem>
                {editable && onEdit ? (
                  <DropdownMenuItem onSelect={() => onEdit(doubt)}>
                    <Edit3 className="size-4" aria-hidden="true" /> Edit
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

        <Link to={`/doubts/${doubt.id}`} className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]">
          <h3 className="text-lg font-semibold leading-7 text-slate-950 hover:text-[#2563EB]">{doubt.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{doubt.description}</p>
        </Link>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Related notice:</span>{' '}
          {notice ? (
            <Link to={`/notices/${notice.id}`} className="font-medium text-[#2563EB] hover:underline">
              {notice.title}
            </Link>
          ) : (
            'Notice unavailable'
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium text-slate-700">{author?.name ?? 'Unknown author'}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden="true" /> {formatDate(doubt.createdAt)}
            </span>
            {doubt.attachments.length ? (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="size-3.5" aria-hidden="true" /> {doubt.attachments.length}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <MessageSquare className="size-3.5" aria-hidden="true" /> {doubt.responses.length} response
              {doubt.responses.length === 1 ? '' : 's'}
            </span>
            {respondable ? (
              <Button size="sm" onClick={() => navigate(`/doubts/${doubt.id}`)}>
                Respond
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate(`/doubts/${doubt.id}`)}>
                View
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this doubt?</AlertDialogTitle>
            <AlertDialogDescription>
              “{doubt.title}” and its responses will be removed from the Doubt Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteDoubt(doubt.id)}>
              Delete doubt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
