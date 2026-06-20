import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile(data)
      toast({ title: 'Profile updated', variant: 'success' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Profile" description="Manage your personal information" />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-secure-600/20 text-secure-400 text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <Shield className="h-4 w-4 text-secure-400" />
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="text-sm font-medium text-slate-200">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <Calendar className="h-4 w-4 text-secure-400" />
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="text-sm font-medium text-slate-200">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-critical-400">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-critical-400">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-critical-400">{errors.email.message}</p>}
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
