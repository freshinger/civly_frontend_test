'use client'
import { EditorSidebarRight } from '@/app/(main)/editor/editor-sidebar/editor-sidebar-right'
import { useParams } from 'next/navigation'
import { TemplatePreview } from './TemplatePreview'
import { EditorHeader } from '../editor-sidebar/editor-header'
import { useState } from 'react'

export default function Page() {
  const { id } = useParams() as { id: string }
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  return (
    <div
      className="grid h-screen w-full max-w-full overflow-hidden"
      style={{
        gridTemplateColumns: rightSidebarOpen ? '1fr 400px' : '1fr 0px',
      }}
    >
      <div className="flex flex-col overflow-hidden min-w-0">
        <div className="flex-shrink-0 bg-red-100 border-2 border-red-500">
          <EditorHeader
            cvId={id}
            rightSidebarOpen={rightSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
          />
        </div>
        <div className="flex-1 gap-4 p-4 overflow-auto min-w-0 bg-blue-100">
          <TemplatePreview id={id} />
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${
          rightSidebarOpen ? '' : 'hidden lg:hidden'
        } lg:block overflow-hidden`}
      >
        <div className="w-full h-full">
          <EditorSidebarRight id={id} />
        </div>
      </div>
    </div>
  )
}
