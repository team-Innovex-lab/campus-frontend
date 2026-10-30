import { UploadCloud } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import type { Attachment } from '@/types/campus'
import { cn } from '@/lib/utils'
import { AttachmentList } from './AttachmentList'

interface AttachmentUploadProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
  label?: string
}

function fileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function extension(name: string) {
  return name.split('.').pop()?.toUpperCase() || 'FILE'
}

export function AttachmentUpload({ attachments, onChange, label = 'Attachments' }: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return
    const mapped = Array.from(files).map((file) => ({
      id: `a-${Date.now()}-${file.name}`,
      name: file.name,
      type: extension(file.name),
      size: fileSize(file.size),
    }))
    onChange([...attachments, ...mapped])
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-colors',
          dragging && 'border-[#2563EB] bg-[#EAF2FF]',
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <UploadCloud className="mx-auto size-8 text-[#2563EB]" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">Drag files here or browse from your device.</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
      <AttachmentList
        attachments={attachments}
        contextTitle="Uploaded attachment"
        onRemove={(id) => onChange(attachments.filter((attachment) => attachment.id !== id))}
      />
    </div>
  )
}
