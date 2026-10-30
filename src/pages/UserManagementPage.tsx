import { Edit3, PlusCircle, Search, ShieldAlert, UserRoundCheck, UserRoundX, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { RoleBadge } from '@/components/campus/Badges'
import { EmptyState } from '@/components/campus/EmptyState'
import { PageHeader } from '@/components/campus/PageHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { departments } from '@/data/campus'
import { useCampus } from '@/context/CampusContext'
import { initials } from '@/lib/format'
import { canAdministerUsers } from '@/lib/permissions'
import type { Role, User } from '@/types/campus'

const roleOptions: Role[] = ['Admin', 'Faculty', 'Office Staff', 'Student']

export default function UserManagementPage() {
  const { currentUser, users, addUser, updateUser, toggleUserActive } = useCampus()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deactivating, setDeactivating] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'Student' as Role, department: 'Computer Science', title: '' })

  const filtered = useMemo(() => users
    .filter((user) => role === 'All' || user.role === role)
    .filter((user) => [user.name, user.email, user.department, user.role].join(' ').toLowerCase().includes(query.toLowerCase())),
  [users, query, role])

  if (!canAdministerUsers(currentUser)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        description="Only Admin users can manage campus accounts and role assignments."
      />
    )
  }

  const resetForm = () => setForm({ name: '', email: '', role: 'Student', department: 'Computer Science', title: '' })

  const openEdit = (user: User) => {
    setEditing(user)
    setForm({ name: user.name, email: user.email, role: user.role, department: user.department, title: user.title })
  }

  const saveUser = () => {
    if (form.name.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(form.email) || !form.title.trim()) {
      toast.error('Enter a name, valid email, role, department, and title')
      return
    }
    if (editing) {
      updateUser(editing.id, { ...form, name: form.name.trim(), email: form.email.trim(), title: form.title.trim() })
      setEditing(null)
    } else {
      addUser({ ...form, name: form.name.trim(), email: form.email.trim(), title: form.title.trim() })
      setInviteOpen(false)
    }
    resetForm()
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Review campus accounts, update roles and departments, and control account access."
        actions={<Button onClick={() => { resetForm(); setInviteOpen(true) }}><PlusCircle className="size-4" aria-hidden="true" /> Invite user</Button>}
      />

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users…" className="h-11 pl-9" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All roles</SelectItem>
            {roleOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="min-w-64">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback className="bg-[#EAF2FF] font-semibold text-[#153E75]">{initials(user.name)}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                          <Edit3 className="size-4" aria-hidden="true" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className={user.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-700 hover:text-emerald-800'} onClick={() => setDeactivating(user)}>
                          {user.active ? <UserRoundX className="size-4" aria-hidden="true" /> : <UserRoundCheck className="size-4" aria-hidden="true" />}
                          {user.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={UsersRound} title="No users found" description="Adjust the search or role filter to find campus accounts." />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen || !!editing} onOpenChange={(open) => {
        if (!open) {
          setInviteOpen(false)
          setEditing(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit user' : 'Invite user'}</DialogTitle>
            <DialogDescription>{editing ? 'Update role and department assignment.' : 'Create a demo account for a campus user.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as Role })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{roleOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{departments.filter((item) => item !== 'All Departments').map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Assistant Professor" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInviteOpen(false); setEditing(null) }}>Cancel</Button>
            <Button onClick={saveUser}>{editing ? 'Save user' : 'Invite user'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivating} onOpenChange={(open) => !open && setDeactivating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deactivating?.active ? 'Deactivate account?' : 'Activate account?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivating?.active
                ? `${deactivating.name} will lose access to Campus Notice OS until reactivated.`
                : `${deactivating?.name} will regain access to Campus Notice OS.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deactivating) toggleUserActive(deactivating.id)
              setDeactivating(null)
            }}>
              {deactivating?.active ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
