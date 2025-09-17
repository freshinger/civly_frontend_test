'use client'

import React, { useState, useEffect } from 'react'
import { useCvStore } from '@/app/(main)/editor/cv_store'
import { Toast } from './toast'

export function ToastContainer() {
  const { toasts, dismissToast } = useCvStore()
  const [enteredToasts, setEnteredToasts] = useState<Set<string>>(new Set())

  // Track when toasts enter to trigger entrance animation
  useEffect(() => {
    const newToastIds = toasts
      .filter(toast => !toast.isExiting && !enteredToasts.has(toast.id))
      .map(toast => toast.id)
    
    if (newToastIds.length > 0) {
      // Start them offscreen, then animate in
      setTimeout(() => {
        setEnteredToasts(prev => new Set([...prev, ...newToastIds]))
      }, 10) // Small delay to ensure initial render
    }

    // Clean up entered toasts that no longer exist
    const currentToastIds = new Set(toasts.map(t => t.id))
    setEnteredToasts(prev => new Set([...prev].filter(id => currentToastIds.has(id))))
  }, [toasts, enteredToasts])

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
          className={`transform transition-transform duration-300 ease-in-out ${
            toast.isExiting
              ? 'translate-y-full'
              : enteredToasts.has(toast.id) 
              ? 'translate-y-0'
              : 'translate-y-full'
          }`}
        >
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  )
}
