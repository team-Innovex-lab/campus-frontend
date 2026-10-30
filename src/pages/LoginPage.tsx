import { Eye, EyeOff, GraduationCap, LockKeyhole, Mail, Megaphone, MessageCircleQuestion } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampus } from '@/context/CampusContext'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/campus'
import { RoleBadge } from '@/components/campus/Badges'

const roleAccounts: Array<{ role: Role; email: string; description: string }> = [
  { role: 'Admin', email: 'admin@northbridge.edu', description: 'Full oversight and moderation' },
  { role: 'Faculty', email: 'arjun.rao@northbridge.edu', description: 'Publish course notices and answer doubts' },
  { role: 'Office Staff', email: 'office@northbridge.edu', description: 'Circulars, schedules, and student support' },
  { role: 'Student', email: 'aisha.verma@student.northbridge.edu', description: 'Read notices and ask questions' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { currentUser, signIn } = useCampus()
  const [selectedRole, setSelectedRole] = useState<Role>('Admin')
  const [email, setEmail] = useState(roleAccounts[0].email)
  const [password, setPassword] = useState('campus-demo')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  if (currentUser) return <Navigate to="/dashboard" replace />

  const selectRole = (role: Role) => {
    const account = roleAccounts.find((item) => item.role === role)
    setSelectedRole(role)
    if (account) setEmail(account.email)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Enter a valid college email address.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const user = signIn(selectedRole)
    toast.success('Welcome back', { description: `${user.role} workspace is ready.` })
    navigate('/dashboard')
  }

  const sendReset = () => {
    if (!/^\S+@\S+\.\S+$/.test(resetEmail)) {
      toast.error('Enter a valid email for password recovery')
      return
    }
    setForgotOpen(false)
    toast.success('Password reset link sent', { description: resetEmail })
  }

  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-slate-900">
      <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#153E75] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-28 size-96 rounded-full bg-[#2563EB]/35 blur-3xl" />
          <div className="absolute bottom-16 left-16 h-52 w-80 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#153E75]">
              <Megaphone className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold">Campus Notice OS</p>
              <p className="text-sm text-blue-100">NorthBridge College</p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Centralized communication</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight">Your Campus. One Communication Hub.</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Official notices, scheduled publishing, attachments, and structured doubt resolution — organized for every campus role.
            </p>
          </div>

          <div className="relative grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <Megaphone className="size-6 text-blue-100" aria-hidden="true" />
              <p className="mt-4 font-semibold">Reliable official notices</p>
              <p className="mt-2 text-sm leading-6 text-blue-100">Pinned announcements, categories, attachments, and role-aware actions.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <MessageCircleQuestion className="size-6 text-blue-100" aria-hidden="true" />
              <p className="mt-4 font-semibold">Structured doubt resolution</p>
              <p className="mt-2 text-sm leading-6 text-blue-100">Questions stay connected to notices with clear answered states.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#153E75] text-white">
                <GraduationCap className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-slate-950">Campus Notice OS</p>
                <p className="text-sm text-slate-500">NorthBridge College</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold text-[#2563EB]">Welcome back</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Sign in to your workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose a demo role to explore the complete role-aware prototype.
                </p>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Demo role">
                {roleAccounts.map((account) => (
                  <button
                    type="button"
                    key={account.role}
                    onClick={() => selectRole(account.role)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
                      selectedRole === account.role
                        ? 'border-[#2563EB] bg-[#EAF2FF] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    )}
                    aria-pressed={selectedRole === account.role}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <RoleBadge role={account.role} />
                      {selectedRole === account.role ? <span className="size-2 rounded-full bg-[#2563EB]" /> : null}
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-900">{account.description}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={cn('h-11 pl-9', errors.email && 'border-red-500 focus-visible:ring-red-200')}
                      placeholder="name@college.edu"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email ? <p id="email-error" className="text-sm text-red-600">{errors.email}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={cn('h-11 pl-9 pr-11', errors.password && 'border-red-500 focus-visible:ring-red-200')}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    </Button>
                  </div>
                  {errors.password ? <p id="password-error" className="text-sm text-red-600">{errors.password}</p> : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} />
                    Remember me
                  </label>
                  <button type="button" className="text-left text-sm font-semibold text-[#2563EB] hover:underline" onClick={() => {
                    setResetEmail(email)
                    setForgotOpen(true)
                  }}>
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="h-11 w-full rounded-full bg-[#153E75] text-white hover:bg-[#123663]">
                  Sign in as {selectedRole}
                </Button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Prototype authentication stores the selected demo account in this browser only.
            </p>
          </div>
        </section>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>Enter your college email and we will send a recovery link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reset-email">College email</Label>
            <Input id="reset-email" type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
            <Button onClick={sendReset}>Send reset link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
