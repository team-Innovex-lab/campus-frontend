import { ArrowLeft, MessageCircleQuestion, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { AttachmentUpload } from '@/components/campus/AttachmentUpload'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { departments } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { canAskDoubts } from '@/lib/permissions'
import type { Attachment } from '@/types/campus'

export default function AskDoubtPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser, notices, addDoubt } = useCampus()
  const publishedNotices = notices.filter((notice) => notice.status === 'Published')
  const preselected = searchParams.get('notice') ?? publishedNotices[0]?.id ?? ''
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [noticeId, setNoticeId] = useState(preselected)
  const [department, setDepartment] = useState(currentUser?.department ?? 'All Departments')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!canAskDoubts(currentUser)) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="Access denied"
        description="The current role cannot ask doubts. Students, Faculty, and Office Staff can submit questions."
        actionLabel="Open Doubt Center"
        onAction={() => navigate('/doubts')}
      />
    )
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (title.trim().length < 8) next.title = 'Enter a question title of at least 8 characters.'
    if (description.trim().length < 30) next.description = 'Describe the doubt in at least 30 characters.'
    if (!noticeId) next.noticeId = 'Select the related notice.'
    if (!department) next.department = 'Select a department.'
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error('Please fix the highlighted fields')
      return
    }
    const doubt = addDoubt({ title: title.trim(), description: description.trim(), noticeId, department, attachments })
    toast.success('Question submitted', { description: 'You will be notified when an authorized user responds.' })
    navigate(`/doubts/${doubt.id}`)
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/doubts')}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Doubt Center
      </Button>
      <PageHeader
        title="Ask a Doubt"
        description="Connect your question to the relevant notice so the right role can answer it with full context."
      />

      <form onSubmit={submit} noValidate>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question-title">Question title</Label>
                <Input
                  id="question-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setErrors((state) => ({ ...state, title: '' }))
                  }}
                  placeholder="e.g. Can I change my examination hall allocation?"
                  aria-invalid={!!errors.title}
                />
                {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-description">Detailed description</Label>
                <Textarea
                  id="question-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    setErrors((state) => ({ ...state, description: '' }))
                  }}
                  className="min-h-48 leading-7"
                  placeholder="Explain what is unclear, what you already checked, and what decision or clarification you need."
                  aria-invalid={!!errors.description}
                />
                {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Optional attachment</Label>
                <AttachmentUpload attachments={attachments} onChange={setAttachments} label="Upload a screenshot or supporting document" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Related notice</Label>
                <Select value={noticeId} onValueChange={(value) => {
                  setNoticeId(value)
                  setErrors((state) => ({ ...state, noticeId: '' }))
                }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select notice" /></SelectTrigger>
                  <SelectContent>
                    {publishedNotices.map((notice) => <SelectItem key={notice.id} value={notice.id}>{notice.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.noticeId ? <p className="text-sm text-red-600">{errors.noticeId}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>{departments.filter((item) => item !== 'All Departments').map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                {errors.department ? <p className="text-sm text-red-600">{errors.department}</p> : null}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">Response ownership</p>
                <p className="mt-1">Admins can answer any doubt. Faculty and Office Staff can answer doubts connected to their own notices.</p>
              </div>
              <Button type="submit" className="w-full rounded-full bg-[#153E75] hover:bg-[#123663]">
                <Send className="size-4" aria-hidden="true" /> Submit Question
              </Button>
              <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => navigate('/doubts')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
