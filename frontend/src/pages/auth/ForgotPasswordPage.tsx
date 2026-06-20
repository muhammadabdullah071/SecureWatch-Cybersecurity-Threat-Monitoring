import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import * as authService from '@/services/auth.service'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [error, setError] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    try {
      setError('')
      setSentEmail(data.email)
      const response = await authService.forgotPassword(data.email)
      const link = response?.data?.data?.resetLink
      if (link) {
        setResetLink(link)
      }
      setSent(true)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      const msg = axiosError?.response?.data?.message
      if (msg?.includes('not found')) {
        setSent(true)
        setSentEmail('')
      } else {
        setError(msg || 'Failed to send reset email')
      }
    }
  }

  const copyToClipboard = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink)
      toast({ title: 'Reset link copied to clipboard', variant: 'success' })
    }
  }

  if (sent) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
            <CheckCircle className="h-7 w-7 text-success-600 dark:text-success-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
          {sentEmail ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              We&apos;ve sent a password reset link to <span className="font-medium text-slate-700 dark:text-slate-300">{sentEmail}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              If an account exists with that email, a reset link has been sent.
            </p>
          )}
          {resetLink && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left">
              <p className="text-xs font-medium text-slate-500 mb-1.5">Dev Mode - Reset Link:</p>
              <div className="flex items-center gap-2">
                <a
                  href={resetLink}
                  className="text-xs text-secure-600 dark:text-secure-400 break-all hover:underline flex-1"
                >
                  {resetLink}
                </a>
                <button
                  onClick={copyToClipboard}
                  className="shrink-0 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/login">
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </Link>
            {resetLink && (
              <a href={resetLink}>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" /> Open Reset Page
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Forgot Password</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-critical-300 dark:border-critical-800 bg-critical-50 dark:bg-critical-900/30 px-4 py-3 text-sm text-critical-700 dark:text-critical-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-critical-500">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth/login" className="inline-flex items-center text-sm text-secure-600 dark:text-secure-400 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
