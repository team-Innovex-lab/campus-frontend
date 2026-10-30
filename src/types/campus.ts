export type Role = 'Admin' | 'Faculty' | 'Office Staff' | 'Student'

export type NoticeStatus = 'Published' | 'Scheduled' | 'Draft' | 'Archived'
export type Priority = 'Normal' | 'Important' | 'Urgent'
export type DoubtStatus = 'Unanswered' | 'Answered'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department: string
  title: string
  active: boolean
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: string
}

export interface Notice {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  audience: string[]
  department: string
  authorId: string
  status: NoticeStatus
  pinned: boolean
  publishAt: string
  createdAt: string
  updatedAt?: string
  archivedAt?: string
  attachments: Attachment[]
}

export interface DoubtResponse {
  id: string
  authorId: string
  body: string
  createdAt: string
  updatedAt?: string
}

export interface Doubt {
  id: string
  title: string
  description: string
  noticeId: string
  authorId: string
  department: string
  status: DoubtStatus
  createdAt: string
  updatedAt?: string
  attachments: Attachment[]
  responses: DoubtResponse[]
}

export interface AppNotification {
  id: string
  title: string
  body: string
  type: 'notice' | 'doubt' | 'system'
  createdAt: string
  unread: boolean
  link: string
}

export interface ActivityItem {
  id: string
  actorId: string
  action: string
  target: string
  createdAt: string
  type: 'notice' | 'doubt' | 'user' | 'system'
}

export interface NoticeDraft {
  title: string
  description: string
  category: string
  priority: Priority
  audience: string[]
  department: string
  publishAt: string
  attachments: Attachment[]
}

export interface DoubtDraft {
  title: string
  description: string
  noticeId: string
  department: string
  attachments: Attachment[]
}
