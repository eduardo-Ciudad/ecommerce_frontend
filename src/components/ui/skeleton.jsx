import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#F3F4F6]', className)}
      {...props}
    />
  )
}

export { Skeleton }
