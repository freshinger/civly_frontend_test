'use client'

import React from 'react'
import { useCvStore } from '@/app/(main)/editor/cv_store'
import { Toast } from './toast'

export function ToastContainer() {
  const { toasts, removeToast } = useCvStore()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed z-50 flex max-h-screen flex-col space-y-2 overflow-hidden bottom-4 right-4"
      aria-live="polite"
      aria-label="Toast notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-bottom-5 duration-300 ease-out"
          style={{
            animationFillMode: 'forwards',
          }}
        >
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  )
}
