import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { CampusProvider, useCampus } from '@/context/CampusContext'
import ArchivedNoticesPage from '@/pages/ArchivedNoticesPage'
import AskDoubtPage from '@/pages/AskDoubtPage'
import DashboardPage from '@/pages/DashboardPage'
import DoubtCenterPage from '@/pages/DoubtCenterPage'
import DoubtDetailsPage from '@/pages/DoubtDetailsPage'
import HelpPage from '@/pages/HelpPage'
import LoginPage from '@/pages/LoginPage'
import MyDoubtsPage from '@/pages/MyDoubtsPage'
import MyResponsesPage from '@/pages/MyResponsesPage'
import NoticeBoardPage from '@/pages/NoticeBoardPage'
import NoticeDetailsPage from '@/pages/NoticeDetailsPage'
import NoticeEditorPage from '@/pages/NoticeEditorPage'
import NotificationsPage from '@/pages/NotificationsPage'
import ProfilePage from '@/pages/ProfilePage'
import ScheduledNoticesPage from '@/pages/ScheduledNoticesPage'
import SettingsPage from '@/pages/SettingsPage'
import UserManagementPage from '@/pages/UserManagementPage'

function RequireAuth() {
  const { currentUser } = useCampus()
  return currentUser ? <AppLayout /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <CampusProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notices" element={<NoticeBoardPage />} />
          <Route path="/notices/new" element={<NoticeEditorPage />} />
          <Route path="/notices/:id" element={<NoticeDetailsPage />} />
          <Route path="/notices/:id/edit" element={<NoticeEditorPage />} />
          <Route path="/scheduled" element={<ScheduledNoticesPage />} />
          <Route path="/archived" element={<ArchivedNoticesPage />} />
          <Route path="/doubts" element={<DoubtCenterPage />} />
          <Route path="/doubts/ask" element={<AskDoubtPage />} />
          <Route path="/doubts/:id" element={<DoubtDetailsPage />} />
          <Route path="/my-doubts" element={<MyDoubtsPage />} />
          <Route path="/my-responses" element={<MyResponsesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </CampusProvider>
  )
}
