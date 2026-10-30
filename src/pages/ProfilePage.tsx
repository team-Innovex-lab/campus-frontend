import { Camera, Save } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { RoleBadge } from '@/components/campus/Badges'
import { PageHeader } from '@/components/campus/PageHeader'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampus } from '@/context/CampusContext'
import { initials } from '@/lib/format'

export default function ProfilePage() {
  const { currentUser, updateProfile } = useCampus()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [department, setDepartment] = useState(currentUser?.department ?? '')
  const [title, setTitle] = useState(currentUser?.title ?? '')

  if (!currentUser) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || !department.trim() || !title.trim()) {
      toast.error('Complete every profile field with a valid value')
      return
    }
    updateProfile({ name: name.trim(), email: email.trim(), department: department.trim(), title: title.trim() })
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage the account details shown beside notices, doubts, and responses." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Avatar className="size-28 border-4 border-[#EAF2FF]">
              <AvatarFallback className="bg-[#153E75] text-2xl font-bold text-white">{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-5 text-xl font-bold text-slate-950">{currentUser.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{currentUser.title}</p>
            <RoleBadge role={currentUser.role} className="mt-3" />
            <Button variant="outline" className="mt-6 rounded-full" onClick={() => fileRef.current?.click()}>
              <Camera className="size-4" aria-hidden="true" /> Change photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => toast.success('Profile photo selected', { description: 'This prototype keeps the existing avatar after selection.' })}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Account settings</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-department">Department</Label>
                <Input id="profile-department" value={department} onChange={(event) => setDepartment(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-title">Title</Label>
                <Input id="profile-title" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="rounded-full bg-[#153E75] hover:bg-[#123663]">
                  <Save className="size-4" aria-hidden="true" /> Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm xl:col-span-2">
          <CardHeader><CardTitle>Role permissions</CardTitle></CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Notice permissions</p>
              <p className="mt-1">
                {currentUser.role === 'Student'
                  ? 'Students can read published notices and download attachments.'
                  : 'This role can create notices and manage its own published, scheduled, and archived notices.'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Doubt permissions</p>
              <p className="mt-1">
                {currentUser.role === 'Admin'
                  ? 'Admin can moderate doubts and respond to questions associated with any notice.'
                  : currentUser.role === 'Student'
                    ? 'Students can ask doubts and edit them while unanswered.'
                    : 'This role can ask doubts and respond to doubts connected to its own notices.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
