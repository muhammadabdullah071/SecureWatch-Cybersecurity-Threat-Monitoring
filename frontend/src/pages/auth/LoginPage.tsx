import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail) {
      setValue('email', savedEmail)
      setValue('password', savedPassword || '')
      setValue('rememberMe', true)
    }
  }, [setValue])

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
        localStorage.setItem('rememberedPassword', data.password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }
      await login({ email: data.email, password: data.password })
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your SecureWatch account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-critical-300 dark:border-critical-800 bg-critical-50 dark:bg-critical-900/30 px-4 py-3 text-sm text-critical-700 dark:text-critical-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className={`bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${errors.email ? 'border-critical-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-critical-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
              <Link to="/auth/forgot-password" className="text-xs text-secure-600 dark:text-secure-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${errors.password ? 'border-critical-500 pr-10' : 'pr-10'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-critical-500">{errors.password.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-secure-600 focus:ring-secure-500"
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal text-slate-600 dark:text-slate-400">Remember me</Label>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-secure-600 dark:text-secure-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
