import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#F9A8C9] text-[#111827]',
        secondary: 'border-transparent bg-[#F9FAFB] text-[#6B7280]',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline: 'border-[#E5E7EB] text-[#6B7280]',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-yellow-100 text-yellow-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
        purple: 'border-transparent bg-purple-100 text-purple-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
