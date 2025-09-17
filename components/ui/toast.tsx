import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { ToastItem } from '@/app/(main)/editor/cv_store'

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = toastIcons[toast.type]

  const handleDismiss = () => {
    onDismiss(toast.id)
  }

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full max-w-md items-center space-x-3 rounded-lg border p-4 pr-8 transition-all duration-300 ease-in-out',
        toastStyles[toast.type],
      )}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon
          className={cn('h-5 w-5', iconStyles[toast.type])}
          aria-hidden="true"
        />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0 font-medium text-sm">{toast.message}</div>

      {/* Dismiss button - always present */}
      <button
        type="button"
        className="absolute right-2 top-2 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:hover:bg-white/5"
        onClick={handleDismiss}
      >
        <span className="sr-only">Dismiss</span>
        <X className="h-4 w-4 opacity-50" aria-hidden="true" />
      </button>
    </div>
  )
}
