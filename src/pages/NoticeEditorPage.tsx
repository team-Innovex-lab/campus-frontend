import { ArrowLeft, CalendarClock, FilePlus2, Save, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { AttachmentUpload } from '@/components/campus/AttachmentUpload'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { audiences, categories, departments } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { fromDateTimeLocal, toDateTimeLocal } from '@/lib/format'
import { canManageOwnNotice, canPostNotices } from '@/lib/permissions'
import type { Attachment, NoticeStatus, Priority } from '@/types/campus'

interface FormState {
  title: string
  description: string
  category: string
  priority: Priority
  audience: string[]
  department: string
  scheduleAt: string
  attachments: Attachment[]
}

const defaultState: FormState = {
  title: '',
  description: '',
  category: 'Academics',
  priority: 'Normal',
  audience: ['All Campus'],
  department: 'All Departments',
  scheduleAt: '',
  attachments: [],
}

export default function NoticeEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, notices, addNotice, updateNotice } = useCampus()
  const existing = id ? notices.find((notice) => notice.id === id) : undefined
  const [form, setForm] = useState<FormState>(() =>
    existing
      ? {
          title: existing.title,
          description: existing.description,
          category: existing.category,
          priority: existing.priority,
          audience: existing.audience,
          department: existing.department,
          scheduleAt: existing.status === 'Scheduled' ? toDateTimeLocal(existing.publishAt) : '',
          attachments: existing.attachments,
        }
      : defaultState,
  )
  const [showSchedule, setShowSchedule] = useState(existing?.status === 'Scheduled')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const authorized = existing ? canManageOwnNotice(currentUser, existing) : canPostNotices(currentUser)
  const pageTitle = existing ? 'Edit Notice' : 'Create Notice'

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((state) => ({ ...state, [key]: value }))
    setErrors((state) => ({ ...state, [key]: '' }))
  }

  const validate = (needsSchedule = false) => {
    const next: Record<string, string> = {}
    if (form.title.trim().length < 8) next.title = 'Enter a clear notice title of at least 8 characters.'
    if (form.description.trim().length < 40) next.description = 'Provide at least 40 characters so readers understand the notice.'
    if (!form.category) next.category = 'Select a category.'
    if (!form.department) next.department = 'Select a department.'
    if (!form.audience.length) next.audience = 'Select at least one audience.'
    if (needsSchedule && !form.scheduleAt) next.scheduleAt = 'Choose a publication date and time.'
    if (needsSchedule && form.scheduleAt && new Date(form.scheduleAt).getTime() <= Date.now()) {
      next.scheduleAt = 'Scheduled time must be in the future.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const draftPayload = (status: NoticeStatus) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    priority: form.priority,
    audience: form.audience,
    department: form.department,
    publishAt: status === 'Scheduled' && form.scheduleAt ? fromDateTimeLocal(form.scheduleAt) : existing?.publishAt ?? new Date().toISOString(),
    attachments: form.attachments,
  })

  const save = (status: NoticeStatus) => {
    const valid = validate(status === 'Scheduled')
    if (!valid) {
      toast.error('Please fix the highlighted fields')
      return
    }
    const payload = draftPayload(status)
    if (existing) {
      updateNotice(existing.id, payload, status)
      toast.success(status === 'Scheduled' ? 'Notice schedule updated' : status === 'Published' ? 'Notice published' : 'Draft updated')
      navigate(status === 'Scheduled' ? '/scheduled' : `/notices/${existing.id}`)
      return
    }
    const notice = addNotice(payload, status)
    toast.success(status === 'Scheduled' ? 'Notice scheduled' : status === 'Published' ? 'Notice published' : 'Draft saved')
    navigate(status === 'Scheduled' ? '/scheduled' : `/notices/${notice.id}`)
  }

  if (!authorized) {
    return (
      <EmptyState
        icon={FilePlus2}
        title="Access denied"
        description="Your current role cannot create or edit this notice. Switch to an authorized role from the profile menu."
        actionLabel="Open Notice Board"
        onAction={() => navigate('/notices')}
      />
    )
  }

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Back
      </Button>
      <PageHeader
        title={pageTitle}
        description="Write a concise official notice, choose the audience, attach supporting files, and publish or schedule it."
      />

      <form onSubmit={(event: FormEvent) => { event.preventDefault(); save('Published') }} noValidate>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="notice-title">Notice title</Label>
                <Input
                  id="notice-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="e.g. Internal Assessment Examination Timetable"
                  aria-invalid={!!errors.title}
                />
                {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice-description">Description</Label>
                <Textarea
                  id="notice-description"
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Write the complete notice content. Include dates, eligibility, required actions, and contact information."
                  className="min-h-52 resize-y leading-7"
                  aria-invalid={!!errors.description}
                />
                <div className="flex justify-between gap-4 text-xs text-slate-500">
                  <span>Keep the first two lines informative for feed previews.</span>
                  <span>{form.description.length} characters</span>
                </div>
                {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
              </div>

              <div className="space-y-3">
                <Label>Attachments</Label>
                <AttachmentUpload
                  attachments={form.attachments}
                  onChange={(attachments) => update('attachments', attachments)}
                  label="Upload circulars, timetables, forms, or guidelines"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value) => update('category', value)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.category ? <p className="text-sm text-red-600">{errors.category}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(value) => update('priority', value as Priority)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Important">Important</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(value) => update('department', value)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.department ? <p className="text-sm text-red-600">{errors.department}</p> : null}
                </div>

                <div className="space-y-3">
                  <Label>Audience</Label>
                  <div className="grid gap-3">
                    {audiences.map((audience) => (
                      <label key={audience} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50">
                        <Checkbox
                          checked={form.audience.includes(audience)}
                          onCheckedChange={(checked) => {
                            const next = checked === true
                              ? [...form.audience, audience]
                              : form.audience.filter((item) => item !== audience)
                            update('audience', next)
                          }}
                        />
                        {audience}
                      </label>
                    ))}
                  </div>
                  {errors.audience ? <p className="text-sm text-red-600">{errors.audience}</p> : null}
                </div>
              </CardContent>
            </Card>

            {showSchedule ? (
              <Card className="border-blue-200 bg-[#F5F9FF] shadow-sm">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 font-semibold text-[#153E75]">
                    <CalendarClock className="size-5" aria-hidden="true" /> Schedule publication
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-at">Publication date and time</Label>
                    <Input
                      id="schedule-at"
                      type="datetime-local"
                      value={form.scheduleAt}
                      onChange={(event) => update('scheduleAt', event.target.value)}
                      aria-invalid={!!errors.scheduleAt}
                    />
                    {errors.scheduleAt ? <p className="text-sm text-red-600">{errors.scheduleAt}</p> : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <Button type="submit" className="w-full rounded-full bg-[#153E75] hover:bg-[#123663]">
                  <Send className="size-4" aria-hidden="true" /> Publish Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    if (!showSchedule) {
                      setShowSchedule(true)
                      toast.info('Choose a publication date and time')
                      return
                    }
                    save('Scheduled')
                  }}
                >
                  <CalendarClock className="size-4" aria-hidden="true" /> Schedule Publication
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => save('Draft')}>
                  <Save className="size-4" aria-hidden="true" /> Save Draft
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
