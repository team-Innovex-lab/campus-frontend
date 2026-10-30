import type { Attachment } from '@/types/campus'

export function downloadAttachment(attachment: Attachment, contextTitle: string) {
  const content = [
    `Campus Notice OS attachment preview`,
    `Document: ${attachment.name}`,
    `Type: ${attachment.type}`,
    `Size: ${attachment.size}`,
    `Related item: ${contextTitle}`,
    '',
    'This prototype generates a local demonstration file instead of fetching a real campus document.',
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = attachment.name.replace(/\.[^.]+$/, '') + '-preview.txt'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
