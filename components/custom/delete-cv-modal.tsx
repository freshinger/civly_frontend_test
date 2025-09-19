'use client'

import React from 'react'
import { CvData } from '@/schemas/cv_data_schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteCvModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cv: CvData | null
  onDelete: () => void
}

export function DeleteCvModal({
  isOpen,
  onOpenChange,
  cv,
  onDelete,
}: DeleteCvModalProps) {
  if (!cv) return null

  // Function to get CV display name
  const getCvDisplayName = (cv: CvData) => {
    // First priority: use the CV name field if it exists
    if (cv.name && cv.name.trim()) {
      return cv.name.trim()
    }

    // Second priority: use personal information
    const personalInfo = cv.personalInformation || {}
    const name = personalInfo.name || ''
    const surname = personalInfo.surname || ''

    if (name || surname) {
      return `CV - ${name} ${surname}`.trim()
    }

    // Third priority: use email
    const email = personalInfo.email || ''
    if (email) {
      return `CV - ${email.split('@')[0]}`
    }

    // Fallback to ID or date
    const dateStr = cv.createdAt
      ? new Date(cv.createdAt).toLocaleDateString()
      : ''
    return `CV - ${dateStr || cv.id?.toString().slice(0, 8)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete CV
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the CV{' '}
            <strong>{getCvDisplayName(cv)}</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-destructive/20 p-1 rounded-full mt-0.5">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Permanent Deletion Warning
                </p>
                <p className="text-sm text-destructive/80 mt-1">
                  This CV and all its data will be permanently removed from your
                  account. This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
            }}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="bg-destructive hover:bg-destructive/90 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete CV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
