import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  demoUsers,
  initialActivities,
  initialDoubts,
  initialNotices,
  initialNotifications,
} from '@/data/campus'
import type {
  ActivityItem,
  AppNotification,
  Doubt,
  DoubtDraft,
  DoubtResponse,
  Notice,
  NoticeDraft,
  NoticeStatus,
  Role,
  User,
} from '@/types/campus'

const storageKeys = {
  userId: 'campus-notice-os:user-id',
  users: 'campus-notice-os:users',
  notices: 'campus-notice-os:notices',
  doubts: 'campus-notice-os:doubts',
  notifications: 'campus-notice-os:notifications',
  activities: 'campus-notice-os:activities',
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

interface CampusContextValue {
  users: User[]
  currentUser: User | null
  notices: Notice[]
  doubts: Doubt[]
  notifications: AppNotification[]
  activities: ActivityItem[]
  unreadCount: number
  signIn: (role: Role) => User
  signOut: () => void
  switchRole: (role: Role) => User | undefined
  addNotice: (draft: NoticeDraft, status: NoticeStatus) => Notice
  updateNotice: (id: string, draft: NoticeDraft, status?: NoticeStatus) => Notice | undefined
  deleteNotice: (id: string) => void
  togglePinNotice: (id: string) => void
  archiveNotice: (id: string) => void
  restoreNotice: (id: string) => void
  cancelSchedule: (id: string) => void
  addDoubt: (draft: DoubtDraft) => Doubt
  updateDoubt: (id: string, draft: DoubtDraft) => void
  deleteDoubt: (id: string) => void
  addResponse: (doubtId: string, body: string) => void
  updateResponse: (doubtId: string, responseId: string, body: string) => void
  deleteResponse: (doubtId: string, responseId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  updateProfile: (updates: Partial<Pick<User, 'name' | 'department' | 'title' | 'email'>>) => void
  addUser: (user: Omit<User, 'id' | 'active'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  toggleUserActive: (id: string) => void
  resetDemoData: () => void
}

const CampusContext = createContext<CampusContextValue | null>(null)

export function CampusProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => readStored(storageKeys.users, demoUsers))
  const [notices, setNotices] = useState<Notice[]>(() => readStored(storageKeys.notices, initialNotices))
  const [doubts, setDoubts] = useState<Doubt[]>(() => readStored(storageKeys.doubts, initialDoubts))
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readStored(storageKeys.notifications, initialNotifications),
  )
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    readStored(storageKeys.activities, initialActivities),
  )
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    window.localStorage.getItem(storageKeys.userId),
  )

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId && user.active) ?? null,
    [users, currentUserId],
  )
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications])

  useEffect(() => writeStored(storageKeys.users, users), [users])
  useEffect(() => writeStored(storageKeys.notices, notices), [notices])
  useEffect(() => writeStored(storageKeys.doubts, doubts), [doubts])
  useEffect(() => writeStored(storageKeys.notifications, notifications), [notifications])
  useEffect(() => writeStored(storageKeys.activities, activities), [activities])
  useEffect(() => {
    if (currentUserId) window.localStorage.setItem(storageKeys.userId, currentUserId)
    else window.localStorage.removeItem(storageKeys.userId)
  }, [currentUserId])

  const logActivity = (action: string, target: string, type: ActivityItem['type']) => {
    if (!currentUser) return
    setActivities((items) => [
      {
        id: createId('ac'),
        actorId: currentUser.id,
        action,
        target,
        type,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ])
  }

  const notify = (title: string, body: string, type: AppNotification['type'], link: string) => {
    setNotifications((items) => [
      {
        id: createId('nt'),
        title,
        body,
        type,
        link,
        createdAt: new Date().toISOString(),
        unread: true,
      },
      ...items,
    ])
  }

  const signIn = (role: Role) => {
    const user = users.find((candidate) => candidate.role === role && candidate.active)
    if (!user) throw new Error(`No active ${role} account is available`)
    setCurrentUserId(user.id)
    toast.success(`Signed in as ${user.name}`)
    return user
  }

  const signOut = () => {
    setCurrentUserId(null)
    toast.success('Signed out of Campus Notice OS')
  }

  const switchRole = (role: Role) => {
    const user = users.find((candidate) => candidate.role === role && candidate.active)
    if (user) {
      setCurrentUserId(user.id)
      toast.info(`Viewing as ${user.name}`, { description: `${role} · ${user.department}` })
    }
    return user
  }

  const addNotice = (draft: NoticeDraft, status: NoticeStatus) => {
    if (!currentUser) throw new Error('Sign in to publish a notice')
    const now = new Date().toISOString()
    const notice: Notice = {
      id: createId('n'),
      ...draft,
      authorId: currentUser.id,
      status,
      pinned: false,
      publishAt: status === 'Published' ? now : draft.publishAt,
      createdAt: now,
    }
    setNotices((items) => [notice, ...items])
    logActivity(
      status === 'Published' ? 'published' : status === 'Scheduled' ? 'scheduled' : 'saved draft for',
      notice.title,
      'notice',
    )
    notify(
      status === 'Published' ? 'Notice published' : status === 'Scheduled' ? 'Notice scheduled' : 'Draft saved',
      notice.title,
      'notice',
      status === 'Scheduled' ? '/scheduled' : `/notices/${notice.id}`,
    )
    return notice
  }

  const updateNotice = (id: string, draft: NoticeDraft, status?: NoticeStatus) => {
    let updatedNotice: Notice | undefined
    setNotices((items) =>
      items.map((notice) => {
        if (notice.id !== id) return notice
        updatedNotice = {
          ...notice,
          ...draft,
          status: status ?? notice.status,
          publishAt: status === 'Published' ? new Date().toISOString() : draft.publishAt,
          updatedAt: new Date().toISOString(),
          archivedAt: status === 'Archived' ? new Date().toISOString() : undefined,
        }
        return updatedNotice
      }),
    )
    if (updatedNotice) {
      logActivity('updated', updatedNotice.title, 'notice')
      notify('Notice updated', updatedNotice.title, 'notice', `/notices/${id}`)
    }
    return updatedNotice
  }

  const deleteNotice = (id: string) => {
    const notice = notices.find((item) => item.id === id)
    setNotices((items) => items.filter((item) => item.id !== id))
    if (notice) {
      logActivity('deleted', notice.title, 'notice')
      toast.success('Notice deleted', { description: notice.title })
    }
  }

  const togglePinNotice = (id: string) => {
    const notice = notices.find((item) => item.id === id)
    setNotices((items) =>
      items.map((item) => (item.id === id ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() } : item)),
    )
    if (notice) toast.success(notice.pinned ? 'Notice unpinned' : 'Notice pinned')
  }

  const archiveNotice = (id: string) => {
    const notice = notices.find((item) => item.id === id)
    setNotices((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: 'Archived', pinned: false, archivedAt: new Date().toISOString() }
          : item,
      ),
    )
    if (notice) {
      logActivity('archived', notice.title, 'notice')
      toast.success('Notice archived')
    }
  }

  const restoreNotice = (id: string) => {
    const notice = notices.find((item) => item.id === id)
    setNotices((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: 'Published', archivedAt: undefined, publishAt: new Date().toISOString() }
          : item,
      ),
    )
    if (notice) {
      logActivity('restored', notice.title, 'notice')
      toast.success('Notice restored to the board')
    }
  }

  const cancelSchedule = (id: string) => {
    const notice = notices.find((item) => item.id === id)
    setNotices((items) =>
      items.map((item) => (item.id === id ? { ...item, status: 'Draft', updatedAt: new Date().toISOString() } : item)),
    )
    if (notice) {
      logActivity('cancelled schedule for', notice.title, 'notice')
      toast.success('Schedule cancelled', { description: 'The notice is now saved as a draft.' })
    }
  }

  const addDoubt = (draft: DoubtDraft) => {
    if (!currentUser) throw new Error('Sign in to ask a doubt')
    const doubt: Doubt = {
      id: createId('d'),
      ...draft,
      authorId: currentUser.id,
      status: 'Unanswered',
      createdAt: new Date().toISOString(),
      responses: [],
    }
    setDoubts((items) => [doubt, ...items])
    logActivity('asked', doubt.title, 'doubt')
    notify('Doubt submitted', doubt.title, 'doubt', `/doubts/${doubt.id}`)
    return doubt
  }

  const updateDoubt = (id: string, draft: DoubtDraft) => {
    setDoubts((items) =>
      items.map((doubt) =>
        doubt.id === id ? { ...doubt, ...draft, updatedAt: new Date().toISOString() } : doubt,
      ),
    )
    toast.success('Doubt updated')
  }

  const deleteDoubt = (id: string) => {
    const doubt = doubts.find((item) => item.id === id)
    setDoubts((items) => items.filter((item) => item.id !== id))
    if (doubt) {
      logActivity('deleted', doubt.title, 'doubt')
      toast.success('Doubt deleted')
    }
  }

  const addResponse = (doubtId: string, body: string) => {
    if (!currentUser) return
    setDoubts((items) =>
      items.map((doubt) => {
        if (doubt.id !== doubtId) return doubt
        const response: DoubtResponse = {
          id: createId('r'),
          authorId: currentUser.id,
          body,
          createdAt: new Date().toISOString(),
        }
        return {
          ...doubt,
          status: 'Answered',
          responses: [...doubt.responses, response],
        }
      }),
    )
    const doubt = doubts.find((item) => item.id === doubtId)
    if (doubt) {
      logActivity('responded to', doubt.title, 'doubt')
      notify('Doubt answered', doubt.title, 'doubt', `/doubts/${doubtId}`)
      toast.success('Response posted', { description: 'The question is now marked as answered.' })
    }
  }

  const updateResponse = (doubtId: string, responseId: string, body: string) => {
    setDoubts((items) =>
      items.map((doubt) =>
        doubt.id === doubtId
          ? {
              ...doubt,
              responses: doubt.responses.map((response) =>
                response.id === responseId
                  ? { ...response, body, updatedAt: new Date().toISOString() }
                  : response,
              ),
            }
          : doubt,
      ),
    )
    toast.success('Response updated')
  }

  const deleteResponse = (doubtId: string, responseId: string) => {
    setDoubts((items) =>
      items.map((doubt) => {
        if (doubt.id !== doubtId) return doubt
        const responses = doubt.responses.filter((response) => response.id !== responseId)
        return { ...doubt, responses, status: responses.length ? 'Answered' : 'Unanswered' }
      }),
    )
    toast.success('Response removed')
  }

  const markNotificationRead = (id: string) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
    toast.success('All notifications marked as read')
  }

  const updateProfile = (updates: Partial<Pick<User, 'name' | 'department' | 'title' | 'email'>>) => {
    if (!currentUser) return
    setUsers((items) => items.map((user) => (user.id === currentUser.id ? { ...user, ...updates } : user)))
    toast.success('Profile updated')
  }

  const addUser = (user: Omit<User, 'id' | 'active'>) => {
    const created: User = { ...user, id: createId('u'), active: true }
    setUsers((items) => [...items, created])
    logActivity('invited', user.name, 'user')
    toast.success('User invited', { description: `${user.name} · ${user.role}` })
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((items) => items.map((user) => (user.id === id ? { ...user, ...updates } : user)))
    toast.success('User updated')
  }

  const toggleUserActive = (id: string) => {
    const user = users.find((item) => item.id === id)
    setUsers((items) => items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)))
    if (user) toast.success(user.active ? 'User deactivated' : 'User activated', { description: user.name })
  }

  const resetDemoData = () => {
    setUsers(demoUsers)
    setNotices(initialNotices)
    setDoubts(initialDoubts)
    setNotifications(initialNotifications)
    setActivities(initialActivities)
    toast.success('Demo data reset', { description: 'The prototype has been restored to its initial content.' })
  }

  const value = useMemo<CampusContextValue>(
    () => ({
      users,
      currentUser,
      notices,
      doubts,
      notifications,
      activities,
      unreadCount,
      signIn,
      signOut,
      switchRole,
      addNotice,
      updateNotice,
      deleteNotice,
      togglePinNotice,
      archiveNotice,
      restoreNotice,
      cancelSchedule,
      addDoubt,
      updateDoubt,
      deleteDoubt,
      addResponse,
      updateResponse,
      deleteResponse,
      markNotificationRead,
      markAllNotificationsRead,
      updateProfile,
      addUser,
      updateUser,
      toggleUserActive,
      resetDemoData,
    }),
    [users, currentUser, notices, doubts, notifications, activities, unreadCount],
  )

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
}

export function useCampus() {
  const context = useContext(CampusContext)
  if (!context) throw new Error('useCampus must be used within CampusProvider')
  return context
}
