'use client'

import * as React from 'react'
import { ResumeCard } from './resume-card'
import { CvData } from '@/schemas/cv_data_schema'

interface ResumeGridProps {
  resumes?: CvData[]
  onCreateNew?: () => void
  onEditResume?: (cv: CvData) => void
  onShareResume?: (cv: CvData) => void
  onDuplicateResume?: (cv: CvData) => void
  onExportPdf?: (cv: CvData) => void
  onDeleteResume?: (cv: CvData) => void
  onOpenResume?: (cv: CvData) => void
}

export function ResumeGrid({
  resumes = [],
  onCreateNew,
  onEditResume,
  onShareResume,
  onDuplicateResume,
  onExportPdf,
  onDeleteResume,
  onOpenResume,
}: ResumeGridProps) {
  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Resumes</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <ResumeCard type="create" onClick={onCreateNew} />

        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            type="resume"
            title={resume.name}
            lastEdited={resume.updatedAt}
            previewImage={'resume-2cols-thumbnail.svg'}
            onClick={() => onOpenResume?.(resume)}
            onEdit={() => onEditResume?.(resume)}
            onShare={() => onShareResume?.(resume)}
            onDuplicate={() => onDuplicateResume?.(resume)}
            onExportPdf={() => onExportPdf?.(resume)}
            onDelete={() => onDeleteResume?.(resume)}
          />
        ))}
      </div>
    </div>
  )
}
