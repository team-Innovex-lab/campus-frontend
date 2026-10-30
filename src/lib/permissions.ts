import type { Doubt, Notice, User } from '@/types/campus'

export const canPostNotices = (user?: User | null) =>
  !!user && user.role !== 'Student' && user.active

export const canViewStaffTools = (user?: User | null) =>
  !!user && user.role !== 'Student' && user.active

export const canManageOwnNotice = (user: User | null | undefined, notice: Notice) =>
  !!user && user.role !== 'Student' && notice.authorId === user.id

export const canDeleteNotice = (user: User | null | undefined, notice: Notice) =>
  !!user && (user.role === 'Admin' || (user.role !== 'Student' && notice.authorId === user.id))

export const canAskDoubts = (user?: User | null) =>
  !!user && (user.role === 'Faculty' || user.role === 'Office Staff' || user.role === 'Student') && user.active

export const canDeleteDoubt = (user: User | null | undefined, doubt: Doubt) =>
  !!user && (user.role === 'Admin' || doubt.authorId === user.id)

export const canEditDoubt = (user: User | null | undefined, doubt: Doubt) =>
  !!user && doubt.authorId === user.id && doubt.status === 'Unanswered'

export const canRespondToDoubt = (
  user: User | null | undefined,
  notice: Notice | undefined,
) => {
  if (!user || !notice || !user.active) return false
  if (user.role === 'Admin') return true
  if (user.role === 'Faculty' || user.role === 'Office Staff') {
    return notice.authorId === user.id
  }
  return false
}

export const canManageResponse = (user: User | null | undefined, authorId: string) =>
  !!user && (user.role === 'Admin' || user.id === authorId)

export const canAdministerUsers = (user?: User | null) => !!user && user.role === 'Admin'
