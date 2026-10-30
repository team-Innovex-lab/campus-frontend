import { ArrowLeft, Edit3, MessageCircleQuestion, MessageSquareText, Send, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { AttachmentList } from '@/components/campus/AttachmentList'
import { CategoryBadge, StatusBadge } from '@/components/campus/Badges'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCampus } from '@/context/CampusContext'
import { formatDateTime, initials } from '@/lib/format'
import { canDeleteDoubt, canEditDoubt, canManageResponse, canRespondToDoubt } from '@/lib/permissions'
import type { DoubtResponse } from '@/types/campus'

export default function DoubtDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentUser,
    users,
    notices,
    doubts,
    updateDoubt,
    deleteDoubt,
    addResponse,
    updateResponse,
    deleteResponse,
  } = useCampus()
  const doubt = doubts.find((item) => item.id === id)
  const [response, setResponse] = useState('')
  const [editDoubtOpen, setEditDoubtOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editingResponse, setEditingResponse] = useState<DoubtResponse | null>(null)
  const [editedResponseBody, setEditedResponseBody] = useState('')
  const [deleteDoubtOpen, setDeleteDoubtOpen] = useState(false)
  const [deletingResponse, setDeletingResponse] = useState<DoubtResponse | null>(null)

  if (!doubt) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="Question not found"
        description="The question may have been removed or the link may be incorrect."
        actionLabel="Back to Doubt Center"
        onAction={() => navigate('/doubts')}
      />
    )
  }

  const author = users.find((user) => user.id === doubt.authorId)
  const notice = notices.find((item) => item.id === doubt.noticeId)
  const respondable = canRespondToDoubt(currentUser, notice)
  const editable = canEditDoubt(currentUser, doubt)
  const deletable = canDeleteDoubt(currentUser, doubt)

  const submitResponse = (event: FormEvent) => {
    event.preventDefault()
    if (response.trim().length < 10) {
      toast.error('Write a response of at least 10 characters')
      return
    }
    addResponse(doubt.id, response.trim())
    setResponse('')
  }

  const saveDoubtEdit = () => {
    if (editTitle.trim().length < 8 || editDescription.trim().length < 30) {
      toast.error('Keep a clear title and a description of at least 30 characters')
      return
    }
    updateDoubt(doubt.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      noticeId: doubt.noticeId,
      department: doubt.department,
      attachments: doubt.attachments,
    })
    setEditDoubtOpen(false)
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/doubts')}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Doubt Center
      </Button>

      <PageHeader
        title={doubt.title}
        description="Question details and role-managed responses connected to the original notice."
        actions={
          <div className="flex flex-wrap gap-2">
            {editable ? (
              <Button variant="outline" onClick={() => {
                setEditTitle(doubt.title)
                setEditDescription(doubt.description)
                setEditDoubtOpen(true)
              }}>
                <Edit3 className="size-4" aria-hidden="true" /> Edit doubt
              </Button>
            ) : null}
            {deletable ? (
              <Button variant="destructive" onClick={() => setDeleteDoubtOpen(true)}>
                <Trash2 className="size-4" aria-hidden="true" /> Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={doubt.status} />
                <CategoryBadge label={doubt.department} />
                {notice ? <CategoryBadge label={notice.category} /> : null}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-[#153E75] text-white">{initials(author?.name ?? 'Unknown')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{author?.name ?? 'Unknown author'}</p>
                  <p className="text-sm text-slate-500">{author?.role} · {formatDateTime(doubt.createdAt)}</p>
                </div>
              </div>
              <article className="mt-6 text-base leading-8 text-slate-700">
                {doubt.description.split('\n').map((paragraph) => <p key={paragraph} className="mb-4">{paragraph}</p>)}
              </article>
              {doubt.attachments.length ? (
                <section className="mt-8">
                  <h2 className="mb-3 text-lg font-semibold text-slate-950">Attachments</h2>
                  <AttachmentList attachments={doubt.attachments} contextTitle={doubt.title} />
                </section>
              ) : null}
            </CardContent>
          </Card>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-950">Responses</h2>
              <span className="text-sm text-slate-500">{doubt.responses.length} response{doubt.responses.length === 1 ? '' : 's'}</span>
            </div>
            <div className="space-y-4">
              {doubt.responses.map((item) => {
                const responder = users.find((user) => user.id === item.authorId)
                const manageable = canManageResponse(currentUser, item.authorId)
                return (
                  <Card key={item.id} className="border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback className="bg-[#EAF2FF] text-[#153E75]">{initials(responder?.name ?? 'Responder')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900">{responder?.name ?? 'Unknown responder'}</p>
                            <p className="text-xs text-slate-500">{responder?.role} · {formatDateTime(item.createdAt)}</p>
                          </div>
                        </div>
                        {manageable ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingResponse(item)
                              setEditedResponseBody(item.body)
                            }}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeletingResponse(item)}>
                              Remove
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.body}</p>
                      {item.updatedAt ? <p className="mt-3 text-xs text-slate-400">Edited {formatDateTime(item.updatedAt)}</p> : null}
                    </CardContent>
                  </Card>
                )
              })}
              {doubt.responses.length === 0 ? (
                <EmptyState
                  icon={MessageSquareText}
                  title="No responses yet"
                  description={respondable ? 'Post the first official response to mark this question as answered.' : 'An authorized staff member will respond when available.'}
                />
              ) : null}
            </div>
          </section>

          {respondable ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Add response</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={submitResponse} className="space-y-4">
                  <Textarea
                    value={response}
                    onChange={(event) => setResponse(event.target.value)}
                    placeholder="Write a clear official response. Submitting it will mark the question as answered."
                    className="min-h-32 leading-7"
                  />
                  <Button type="submit" className="rounded-full bg-[#153E75] hover:bg-[#123663]">
                    <Send className="size-4" aria-hidden="true" /> Post Response
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-slate-50 shadow-none">
              <CardContent className="p-5 text-sm leading-6 text-slate-600">
                You can view this discussion, but your current role does not have permission to respond to this question.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Related notice</CardTitle></CardHeader>
            <CardContent>
              {notice ? (
                <Link to={`/notices/${notice.id}`} className="block rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex flex-wrap gap-2">
                    <CategoryBadge label={notice.category} />
                    <StatusBadge status={notice.status} />
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{notice.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{notice.description}</p>
                </Link>
              ) : (
                <p className="text-sm text-slate-500">The linked notice is no longer available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Question rules</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>• You can edit your own question only while it remains unanswered.</p>
              <p>• Admin can respond to doubts associated with any notice.</p>
              <p>• Faculty and Office Staff can respond to doubts associated with their own notices.</p>
              <p>• Student responses are disabled in this prototype.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editDoubtOpen} onOpenChange={setEditDoubtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your doubt</DialogTitle>
            <DialogDescription>Editing is allowed only while the question remains unanswered.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-doubt-title">Title</Label>
              <Input id="edit-doubt-title" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-doubt-description">Description</Label>
              <Textarea id="edit-doubt-description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="min-h-36" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDoubtOpen(false)}>Cancel</Button>
            <Button onClick={saveDoubtEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingResponse} onOpenChange={(open) => !open && setEditingResponse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit response</DialogTitle>
            <DialogDescription>Update the official response without changing its original timestamp.</DialogDescription>
          </DialogHeader>
          <Textarea value={editedResponseBody} onChange={(event) => setEditedResponseBody(event.target.value)} className="min-h-36" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResponse(null)}>Cancel</Button>
            <Button onClick={() => {
              if (editingResponse && editedResponseBody.trim().length >= 10) {
                updateResponse(doubt.id, editingResponse.id, editedResponseBody.trim())
                setEditingResponse(null)
              } else {
                toast.error('Response must be at least 10 characters')
              }
            }}>Save response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDoubtOpen} onOpenChange={setDeleteDoubtOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this doubt?</AlertDialogTitle>
            <AlertDialogDescription>“{doubt.title}” and its responses will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              deleteDoubt(doubt.id)
              navigate('/doubts')
            }}>Delete doubt</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingResponse} onOpenChange={(open) => !open && setDeletingResponse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this response?</AlertDialogTitle>
            <AlertDialogDescription>The response will be removed. If no responses remain, the question returns to unanswered.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              if (deletingResponse) deleteResponse(doubt.id, deletingResponse.id)
              setDeletingResponse(null)
            }}>Remove response</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
