import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-secure-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secure-600 text-white',
        secondary: 'border-transparent bg-slate-800 text-slate-100',
        destructive: 'border-transparent bg-critical-600 text-white',
        outline: 'border-slate-700 text-slate-300',
        warning: 'border-transparent bg-warning-600 text-white',
        success: 'border-transparent bg-success-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
