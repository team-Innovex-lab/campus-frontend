import { HelpCircle, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/campus/PageHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const faqs = [
  {
    question: 'Who can publish a notice?',
    answer: 'Admin, Faculty, and Office Staff can publish notices. Students can read published notices and download attachments but cannot create or edit notices.',
  },
  {
    question: 'What happens when I schedule a notice?',
    answer: 'The notice remains hidden from students until its publication time. Admin can view every scheduled notice, while Faculty and Office Staff see their own scheduled content.',
  },
  {
    question: 'Who can answer a doubt?',
    answer: 'Admin can answer any doubt. Faculty and Office Staff can answer doubts connected to notices they authored. Student responses are disabled in this prototype.',
  },
  {
    question: 'Can I edit a question after it is answered?',
    answer: 'No. You can edit your own doubt only while it remains unanswered. Once an official response is posted, the original question is locked.',
  },
  {
    question: 'How do attachments work in this prototype?',
    answer: 'Attachment rows show filename, type, and size. Download buttons generate local demonstration files rather than fetching official documents.',
  },
]

export default function HelpPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (subject.trim().length < 5 || message.trim().length < 20) {
      toast.error('Enter a subject and a support message of at least 20 characters')
      return
    }
    setSubject('')
    setMessage('')
    toast.success('Support request sent', { description: 'The campus help desk will reply by email.' })
  }

  return (
    <div>
      <PageHeader title="Help & Support" description="Find answers to role, permission, scheduling, and doubt-management questions." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Frequently asked questions</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-slate-900">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-slate-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle className="size-5 text-[#2563EB]" aria-hidden="true" /> Contact support</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Cannot schedule a notice" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-36" placeholder="Describe what you tried and what happened." />
              </div>
              <Button type="submit" className="w-full rounded-full bg-[#153E75] hover:bg-[#123663]">
                <Send className="size-4" aria-hidden="true" /> Send request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
