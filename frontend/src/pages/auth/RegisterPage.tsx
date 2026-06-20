import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Role } from '@/types'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[@$!%*?&#]/, 'Must contain a special character (@$!%*?&#)'),
  confirmPassword: z.string(),
  role: z.nativeEnum(Role),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (@$!%*?&#)', test: (p: string) => /[@$!%*?&#]/.test(p) },
]

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: Role.ANALYST,
    },
  })

  const watchedPassword = watch('password') || ''

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('')
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      const msg = axiosError?.response?.data?.message
      if (msg?.includes('password')) {
        setError('Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)')
      } else {
        setError(msg || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create Account</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join SecureWatch platform</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-critical-300 dark:border-critical-800 bg-critical-50 dark:bg-critical-900/30 px-4 py-3 text-sm text-critical-700 dark:text-critical-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              {errors.firstName && <p className="text-xs text-critical-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              {errors.lastName && <p className="text-xs text-critical-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
            {errors.email && <p className="text-xs text-critical-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-slate-700 dark:text-slate-300">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                {...register('password')}
                className="pr-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-critical-500">{errors.password.message}</p>}
            <div className="space-y-1.5 mt-2">
              {passwordRequirements.map((req) => {
                const met = req.test(watchedPassword)
                return (
                  <div key={req.label} className="flex items-center gap-2 text-xs">
                    {met ? (
                      <Check className="h-3 w-3 text-success-500" />
                    ) : (
                      <X className="h-3 w-3 text-slate-400" />
                    )}
                    <span className={met ? 'text-success-600 dark:text-success-400' : 'text-slate-500'}>
                      {req.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                {...register('confirmPassword')}
                className="pr-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-critical-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value={Role.ANALYST}>Analyst</option>
              <option value={Role.VIEWER}>Viewer</option>
              <option value={Role.ADMIN}>Administrator</option>
            </select>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-secure-600 dark:text-secure-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
