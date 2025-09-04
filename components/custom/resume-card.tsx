'use client'

import * as React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { IconPlus } from '@tabler/icons-react'
import { ResumeCardMenu } from './resume-card-menu'

interface ResumeCardProps {
  type: 'create' | 'resume'
  title?: string
  lastEdited?: string
  previewImage?: string
  onClick?: () => void
  onEdit?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  onExportPdf?: () => void
  onDelete?: () => void
}

export function ResumeCard({
  type,
  title,
  lastEdited,
  previewImage,
  onClick,
  onEdit,
  onShare,
  onDuplicate,
  onExportPdf,
  onDelete,
}: ResumeCardProps) {
  if (type === 'create') {
    return (
      <Card className="group cursor-pointer transition-all hover:shadow-md border-2 border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5 flex flex-col h-full">
        <CardContent
          className="flex flex-col items-center justify-center p-6 min-h-[150px]"
          onClick={onClick}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 transition-colors mb-3">
            <IconPlus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-medium text-center text-primary">
            Create New Resume
          </h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md flex flex-col h-full">
      <CardHeader className="px-4 flex-shrink-0">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="px-4 flex-1" onClick={onClick}>
        <div className="aspect-[4/3] rounded-md overflow-hidden bg-white p-1">
          {previewImage ? (
            <div className="relative w-full h-full">
              <Image
                src={previewImage}
                alt={`${title} preview`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
              <div className="text-muted-foreground text-xs">Preview</div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-shrink-0 pr-2">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-muted-foreground">Edited {lastEdited}</p>
          <div className="ml-auto">
            <ResumeCardMenu
              onEdit={onEdit}
              onShare={onShare}
              onDuplicate={onDuplicate}
              onExportPdf={onExportPdf}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
