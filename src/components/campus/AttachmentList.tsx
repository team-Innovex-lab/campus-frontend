import { Download, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Attachment } from '@/types/campus'
import { downloadAttachment } from '@/lib/download'

interface AttachmentListProps {
  attachments: Attachment[]
  contextTitle: string
  onRemove?: (id: string) => void
}

export function AttachmentList({ attachments, contextTitle, onRemove }: AttachmentListProps) {
  if (!attachments.length) return null
  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{attachment.name}</p>
              <p className="text-xs text-slate-500">
                {attachment.type} · {attachment.size}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadAttachment(attachment, contextTitle)}
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </Button>
            {onRemove ? (
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemove(attachment.id)}>
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Remove {attachment.name}</span>
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
