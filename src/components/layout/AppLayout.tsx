import {
  Archive,
  Bell,
  CalendarClock,
  ChevronRight,
  FilePlus2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircleQuestion,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { useCampus } from '@/context/CampusContext'
import { initials } from '@/lib/format'
import { canAdministerUsers, canPostNotices, canViewStaffTools } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/campus'
import { RoleBadge } from '@/components/campus/Badges'

const roles: Role[] = ['Admin', 'Faculty', 'Office Staff', 'Student']

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Notice Board', href: '/notices', icon: Megaphone },
  { label: 'Create Notice', href: '/notices/new', icon: FilePlus2, permission: canPostNotices },
  { label: 'Scheduled Notices', href: '/scheduled', icon: CalendarClock, permission: canViewStaffTools },
  { label: 'Archived Notices', href: '/archived', icon: Archive, permission: canViewStaffTools },
  { label: 'Doubt Center', href: '/doubts', icon: MessageCircleQuestion },
  { label: 'My Doubts', href: '/my-doubts', icon: MessageSquareText },
  { label: 'My Responses', href: '/my-responses', icon: MessageSquareText },
  { label: 'User Management', href: '/users', icon: UsersRound, permission: canAdministerUsers },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help & Support', href: '/help', icon: HelpCircle },
]

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink to="/dashboard" className="flex min-h-14 items-center gap-3 rounded-xl px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#153E75] shadow-sm">
        <Megaphone className="size-5" aria-hidden="true" />
      </div>
      {!collapsed ? (
        <div>
          <p className="text-sm font-bold tracking-tight text-white">Campus Notice OS</p>
          <p className="text-xs text-blue-100">NorthBridge College</p>
        </div>
      ) : null}
    </NavLink>
  )
}

function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { currentUser } = useCampus()
  const location = useLocation()
  const visibleItems = navItems.filter((item) => !item.permission || item.permission(currentUser))

  return (
    <div className="flex h-full flex-col bg-[#153E75] text-white">
      <div className={cn('px-3 py-4', collapsed && 'px-2')}>
        <Brand collapsed={collapsed} />
      </div>
      <Separator className="bg-white/10" />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" aria-label="Primary navigation">
          {visibleItems.map((item) => {
            const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href + '/'))
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                  active && 'bg-white text-[#153E75] shadow-sm hover:bg-white hover:text-[#153E75]',
                  collapsed && 'justify-center px-2',
                )}
              >
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                {!collapsed ? <span>{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>
      </ScrollArea>
      <div className={cn('border-t border-white/10 p-3', collapsed && 'p-2')}>
        {!collapsed ? (
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Role view</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{currentUser?.role}</span>
              <Badge className="bg-white text-[#153E75] hover:bg-white">Demo</Badge>
            </div>
          </div>
        ) : (
          <div className="mx-auto size-2 rounded-full bg-white/70" />
        )}
      </div>
    </div>
  )
}

function breadcrumbFor(pathname: string) {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    notices: 'Notice Board',
    new: 'Create Notice',
    scheduled: 'Scheduled Notices',
    archived: 'Archived Notices',
    doubts: 'Doubt Center',
    ask: 'Ask a Doubt',
    'my-doubts': 'My Doubts',
    'my-responses': 'My Responses',
    notifications: 'Notifications',
    users: 'User Management',
    settings: 'Settings',
    help: 'Help & Support',
    profile: 'Profile',
  }
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => ({
    label: map[segment] ?? (segment.length > 12 ? 'Details' : segment.replaceAll('-', ' ')),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }))
}

function Topbar({ onOpenMobile, collapsed, onToggleCollapsed }: { onOpenMobile: () => void; collapsed: boolean; onToggleCollapsed: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, notifications, unreadCount, markNotificationRead, switchRole, signOut } = useCampus()
  const [query, setQuery] = useState('')
  const crumbs = breadcrumbFor(location.pathname)

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim()) navigate(`/notices?q=${encodeURIComponent(query.trim())}`)
  }

  const logout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobile} aria-label="Open navigation">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={onToggleCollapsed} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="size-5" aria-hidden="true" /> : <PanelLeftClose className="size-5" aria-hidden="true" />}
        </Button>

        <nav className="hidden min-w-0 items-center text-sm text-slate-500 lg:flex" aria-label="Breadcrumb">
          <button type="button" className="font-medium text-slate-500 hover:text-[#2563EB]" onClick={() => navigate('/dashboard')}>
            Home
          </button>
          {crumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex min-w-0 items-center">
              <ChevronRight className="mx-1 size-4 shrink-0" aria-hidden="true" />
              {index === crumbs.length - 1 ? (
                <span className="truncate font-semibold capitalize text-slate-900">{crumb.label}</span>
              ) : (
                <button type="button" className="truncate capitalize hover:text-[#2563EB]" onClick={() => navigate(crumb.href)}>
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-full max-w-sm items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notices, departments, categories…"
              className="h-10 rounded-full border-slate-200 bg-slate-50 pl-9"
              aria-label="Global search"
            />
          </div>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5" aria-hidden="true" />
              {unreadCount ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount ? <Badge className="bg-[#2563EB] text-white">{unreadCount} new</Badge> : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 py-3"
                onSelect={() => {
                  markNotificationRead(notification.id)
                  navigate(notification.link)
                }}
              >
                <span className="flex w-full items-center gap-2 font-medium">
                  {notification.unread ? <span className="size-2 rounded-full bg-[#2563EB]" /> : null}
                  {notification.title}
                </span>
                <span className="line-clamp-2 text-xs text-slate-500">{notification.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/notifications')}>View all notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-3 rounded-full p-1 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]">
              <Avatar className="size-9 border border-slate-200">
                <AvatarFallback className="bg-[#EAF2FF] font-semibold text-[#153E75]">
                  {initials(currentUser?.name ?? 'Campus User')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block max-w-36 truncate text-sm font-semibold text-slate-900">{currentUser?.name}</span>
                <span className="block text-xs text-slate-500">{currentUser?.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex items-center justify-between gap-2">
                <span>{currentUser?.name}</span>
                {currentUser ? <RoleBadge role={currentUser.role} /> : null}
              </div>
              <p className="mt-1 truncate text-xs font-normal text-slate-500">{currentUser?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/profile')}>
              <UserRound className="size-4" aria-hidden="true" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <Settings className="size-4" aria-hidden="true" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={currentUser?.role} onValueChange={(value) => switchRole(value as Role)}>
              {roles.map((role) => (
                <DropdownMenuRadioItem key={role} value={role}>
                  {role}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout}>
              <LogOut className="size-4" aria-hidden="true" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem('campus-sidebar-collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      window.localStorage.setItem('campus-sidebar-collapsed', String(!value))
      return !value
    })
  }

  const mainLeft = collapsed ? 'md:pl-20' : 'md:pl-72'

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-slate-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 md:block',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 border-r-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Campus navigation</SheetTitle>
            <SheetDescription>Navigate between dashboards, notices, doubts, and account screens.</SheetDescription>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className={cn('min-h-dvh transition-[padding] duration-200', mainLeft)}>
        <Topbar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} onOpenMobile={() => setMobileOpen(true)} />
        <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
