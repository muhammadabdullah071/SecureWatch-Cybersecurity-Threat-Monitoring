import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import * as authService from '@/services/auth.service'

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetForm = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }
    try {
      setError('')
      await authService.resetPassword(token, data.password)
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 3000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Failed to reset password')
    }
  }

  if (success) {
    return (
      <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-900/30">
            <CheckCircle className="h-7 w-7 text-success-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Password Reset!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your password has been successfully reset. Redirecting to login...
          </p>
          <Link to="/auth/login">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white">Reset Password</h2>
          <p className="mt-1 text-sm text-slate-400">Enter your new password</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-critical-800 bg-critical-900/30 px-4 py-3 text-sm text-critical-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Min. 8 characters" {...register('password')} />
            {errors.password && <p className="text-xs text-critical-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="Repeat your password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-critical-400">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth/login" className="inline-flex items-center text-sm text-secure-400 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
