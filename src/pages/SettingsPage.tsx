import { RotateCcw, Save, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/campus/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCampus } from '@/context/CampusContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const { resetDemoData } = useCampus()
  const [noticeEmails, setNoticeEmails] = useState(true)
  const [doubtEmails, setDoubtEmails] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [defaultLanding, setDefaultLanding] = useState('/dashboard')

  return (
    <div>
      <PageHeader title="Settings" description="Configure prototype preferences and restore the demonstration dataset when needed." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Notification preferences</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'New and updated notices', value: noticeEmails, setValue: setNoticeEmails, description: 'Email me when a relevant notice is published or changed.' },
              { label: 'Doubt responses', value: doubtEmails, setValue: setDoubtEmails, description: 'Email me when one of my questions receives a response.' },
              { label: 'Weekly campus digest', value: weeklyDigest, setValue: setWeeklyDigest, description: 'Send a summary of upcoming deadlines every Monday.' },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-900">{item.label}</Label>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
                <Switch checked={item.value} onCheckedChange={item.setValue} aria-label={item.label} />
              </div>
            ))}
            <Button className="rounded-full bg-[#153E75] hover:bg-[#123663]" onClick={() => toast.success('Notification settings saved')}>
              <Save className="size-4" aria-hidden="true" /> Save settings
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Workspace preferences</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default landing page</Label>
              <Select value={defaultLanding} onValueChange={setDefaultLanding}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="/dashboard">Dashboard</SelectItem>
                  <SelectItem value="/notices">Notice Board</SelectItem>
                  <SelectItem value="/doubts">Doubt Center</SelectItem>
                  <SelectItem value="/my-doubts">My Doubts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
              <div>
                <Label className="text-sm font-semibold text-slate-900">Compact interface</Label>
                <p className="mt-1 text-sm leading-6 text-slate-500">Reduce visual spacing for dense administrative work.</p>
              </div>
              <Switch checked={compactMode} onCheckedChange={(checked) => {
                setCompactMode(checked)
                toast.success(checked ? 'Compact mode enabled for this session' : 'Comfortable spacing restored')
              }} />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Prototype data</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Reset notices, doubts, users, notifications, and activity to the original demo content.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    <RotateCcw className="size-4" aria-hidden="true" /> Reset demo data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
                    <AlertDialogDescription>All local prototype changes will be replaced with the original Campus Notice OS sample content.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetDemoData}>Reset data</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Settings2 className="size-4" aria-hidden="true" /> Preferences are stored in this browser only.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
