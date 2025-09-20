'use client'

import React, { useState, useEffect } from 'react'

// --- Store ---
import { useCvStore } from '@/stores/cv_store'

// --- Services ---
import {
  updateCVName,
  fetchCv,
  updateVisibility,
} from '@/services/cv_data.service'
import type { CvData } from '@/schemas/cv_data_schema'

// --- Local Components ---
import { VisibilityModal } from './visibility-modal'
import { ShareModal } from '@/components/custom/share-modal'
import { ResumeCardMenu } from '@/components/custom/resume-card-menu'

// --- Shadcn UI & Icon Imports ---
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PanelLeftIcon } from 'lucide-react'
import {
  IconPencil,
  IconLock,
  IconLockOpen,
  IconCheck,
  IconX,
} from '@tabler/icons-react'

// --- Type Definitions  ---
type SaveStatus = 'Saved' | 'Saving...' | 'Unsaved Changes' | 'Error'
export type Visibility = 'Public' | 'Private' | 'Draft'

// --- The Main Header Component ---
export function EditorHeader({
  cvId = 'dummy',
  rightSidebarOpen,
  setRightSidebarOpen,
}: {
  cvId?: string
  rightSidebarOpen?: boolean
  setRightSidebarOpen?: (open: boolean) => void
}) {
  // --- Store ---
  const { remoteitems: cvs } = useCvStore()

  // --- State Management ---
  const [currentCv, setCurrentCv] = useState<CvData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [cvName, setCvName] = useState('Resume')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Saved')
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  // Load CV from server
  useEffect(() => {
    const loadCV = async () => {
      if (cvId === 'dummy') {
        setCurrentCv(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const cv = await fetchCv(cvId)

        console.log('Loaded CV from server:', cv)
        setCurrentCv(cv)
        setCvName(cv?.name || 'Resume')
      } catch (error) {
        console.error('Error loading CV:', error)
        setCurrentCv(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadCV()
  }, [cvId])

  // Debug logs
  console.log(
    'EditorHeader - cvId:',
    cvId,
    'currentCv:',
    currentCv?.id,
    'isLoading:',
    isLoading,
    'cvName:',
    cvName,
  )

  // Get visibility from currentCv (service data)
  const getVisibility = (): Visibility => {
    const visibility = currentCv?.visibility

    if (visibility === 'public') return 'Public'
    if (visibility === 'private') return 'Private'
    return 'Draft'
  }

  // Handle visibility changes - update CV via service
  // Handle visibility changes - update CV via service
  const handleVisibilityChange = async (
    newVisibility: Visibility,
    newPassword?: string,
  ) => {
    if (!currentCv) {
      return
    }

    // Map UI visibility to schema visibility
    const schemaVisibility =
      newVisibility === 'Public'
        ? ('public' as const)
        : newVisibility === 'Private'
        ? ('private' as const)
        : ('draft' as const)

    try {
      setSaveStatus('Saving...')

      // Update on server
      await updateVisibility(currentCv, schemaVisibility)

      // Update local CV object
      setCurrentCv({
        ...currentCv,
        visibility: schemaVisibility,
        password: newVisibility === 'Private' ? newPassword || '' : undefined,
      })

      setSaveStatus('Saved')
    } catch (error) {
      console.error('Error updating CV visibility:', error)
      setSaveStatus('Error')
    }
  } // --- Share Functions ---
  const handleShare = () => {
    if (currentCv) {
      const url = `${window.location.origin}/view/${currentCv.id}`
      setShareUrl(url)
      setLinkCopied(false)
      setIsShareModalOpen(true)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareViaEmail = () => {
    const cvName = currentCv?.name || 'My CV'
    const subject = `Check out my CV: ${cvName}`
    const body = `Hi,

I hope this message finds you well. I wanted to share my CV with you for your review.

🔗 Link: ${shareUrl}

This link provides access to my current CV with all my professional experience, skills, and qualifications. Please feel free to download or share it as needed.

Best regards`

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)
  }

  // --- Name Editing Functions ---
  const handleNameSave = async () => {
    setIsEditingName(false)

    if (!currentCv || !cvName.trim() || currentCv.id === 'dummy') {
      return
    }

    try {
      setSaveStatus('Saving...')

      // Update on server
      await updateCVName(currentCv.id!, cvName.trim())

      // Update local CV object
      setCurrentCv({
        ...currentCv,
        name: cvName.trim(),
      })

      setSaveStatus('Saved')
    } catch (error) {
      console.error('Error updating CV name:', error)
      setSaveStatus('Error')
      // Revert name on error
      setCvName(currentCv.name || 'Resume')
    }
  }

  const handleNameCancel = () => {
    setCvName(currentCv?.name || 'Resume')
    setIsEditingName(false)
  }

  // If loading or CV not found, show appropriate state
  if (isLoading) {
    return (
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-16">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <span className="text-md font-semibold text-gray-500">
            Loading CV...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs px-2 py-1 font-medium border bg-blue-50 border-blue-200 text-blue-800"
          >
            Loading...
          </Badge>
        </div>
      </header>
    )
  }

  if (!currentCv && cvId !== 'dummy') {
    return (
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-16">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <span className="text-md font-semibold text-gray-500">
            CV not found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs px-2 py-1 font-medium border bg-red-50 border-red-200 text-red-800"
          >
            Error
          </Badge>
        </div>
      </header>
    )
  }

  const getSaveStatusBadgeVariant = () => {
    switch (saveStatus) {
      case 'Saved':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'Saving...':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'Unsaved Changes':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'Error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <>
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-[50px]">
        {/* Left Side: Trigger & Save Status */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 font-medium border ${getSaveStatusBadgeVariant()}`}
          >
            {saveStatus}
          </Badge>
        </div>

        {/* Center: Document Name */}
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={cvName}
                onChange={(e) => setCvName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave()
                  if (e.key === 'Escape') handleNameCancel()
                }}
                autoFocus
                className="text-md font-semibold h-9"
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-green-600 hover:bg-green-100"
                  onClick={handleNameSave}
                >
                  <IconCheck size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-600 hover:bg-gray-100"
                  onClick={handleNameCancel}
                >
                  <IconX size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold">{cvName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditingName(true)}
              >
                <IconPencil size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Visibility */}
        <div className="flex items-center gap-2">
          {/* Draft/Visibility Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-sm"
            onClick={() => setIsVisibilityModalOpen(true)}
          >
            {getVisibility() === 'Public' ? (
              <IconLockOpen size={14} />
            ) : (
              <IconLock size={14} />
            )}
            {getVisibility()}
          </Button>
          {/* Options Menu */}
          <ResumeCardMenu
            align="end"
            side="bottom"
            showEdit={false}
            onShare={handleShare}
            onExportPdf={() => {
              // TODO: Implementar export PDF
              console.log('Export PDF clicked')
            }}
            onDuplicate={() => {
              // TODO: Implementar duplicate
              console.log('Duplicate clicked')
            }}
            onDelete={() => {
              // TODO: Implementar delete
              console.log('Delete clicked')
            }}
          />
          {/* Right Sidebar Trigger */}
          {setRightSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              title={rightSidebarOpen ? 'Hide right panel' : 'Show right panel'}
            >
              <PanelLeftIcon
                size={16}
                className={rightSidebarOpen ? 'rotate-180' : ''}
              />
            </Button>
          )}
        </div>
      </header>

      {/* The Visibility Modal is rendered here */}
      <VisibilityModal
        isOpen={isVisibilityModalOpen}
        onOpenChange={setIsVisibilityModalOpen}
        visibility={getVisibility()}
        password={currentCv?.password || ''}
        onVisibilityChange={handleVisibilityChange}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        cv={currentCv || cvs[0]}
        shareUrl={shareUrl}
        linkCopied={linkCopied}
        onCopyLink={copyShareLink}
        onShareEmail={shareViaEmail}
      />
    </>
  )
}
