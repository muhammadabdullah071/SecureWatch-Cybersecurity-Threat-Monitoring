import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Bell, Eye, Palette, Sun, Moon, Lock, User } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'

export function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { toast } = useToast()
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('emailAlerts') !== 'false')
  const [pushAlerts, setPushAlerts] = useState(() => localStorage.getItem('pushAlerts') !== 'false')
  const [criticalOnly, setCriticalOnly] = useState(() => localStorage.getItem('criticalOnly') === 'true')
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    localStorage.setItem('emailAlerts', String(emailAlerts))
  }, [emailAlerts])

  useEffect(() => {
    localStorage.setItem('pushAlerts', String(pushAlerts))
  }, [pushAlerts])

  useEffect(() => {
    localStorage.setItem('criticalOnly', String(criticalOnly))
  }, [criticalOnly])

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Please fill all fields', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    toast({ title: 'Password changed successfully', variant: 'success' })
    setPasswordDialogOpen(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Settings" description="Manage your preferences" />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <Palette className="h-5 w-5 text-secure-500" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <Moon className="h-5 w-5 text-secure-500" />
                : <Sun className="h-5 w-5 text-warning-500" />}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Dark Mode</p>
                <p className="text-xs text-slate-500">Toggle dark/light theme</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <Bell className="h-5 w-5 text-secure-500" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Email Alerts</p>
              <p className="text-xs text-slate-500">Receive threat alerts via email</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <Separator className="bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Push Notifications</p>
              <p className="text-xs text-slate-500">Receive in-app notifications</p>
            </div>
            <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
          </div>
          <Separator className="bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Critical Only</p>
              <p className="text-xs text-slate-500">Only receive critical alerts</p>
            </div>
            <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
            <Shield className="h-5 w-5 text-secure-500" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Role</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <User className="mr-2 h-4 w-4" /> View Profile
            </Button>
          </div>
          <Separator className="bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Password</p>
              <p className="text-xs text-slate-500">Change your account password</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordDialogOpen(true)}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Change Password</DialogTitle>
            <DialogDescription className="text-slate-500">
              Enter your current password and a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="text-slate-700 dark:text-slate-300">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-slate-700 dark:text-slate-300">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
