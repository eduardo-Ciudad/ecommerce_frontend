import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ErrorMessage({ message, className }) {
  if (!message) return null
  return (
    <div className={cn('flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3', className)}>
      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}
