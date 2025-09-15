'use client'

import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { ResumeGrid } from '@/components/custom/resume-grid'

const mockResumes = [
  {
    id: '20b996e1-7787-454a-a70e-a4fa126e1870',
    title: 'Senior Project Manager',
    lastEdited: '2 days ago',
    previewImage: '/resume-2cols-thumbnail.svg',
  },
  {
    id: '2',
    title: 'Marketing Manager Zalando',
    lastEdited: '3 days ago',
    previewImage: '/resume-2cols-thumbnail.svg',
  },
]

export default function Page() {
  const handleCreateNew = () => {
    console.log('Create new resume')
  }

  const handleEditResume = (id: string) => {
    console.log('Edit resume:', id)
  }

  const handleShareResume = (id: string) => {
    console.log('Share resume:', id)
  }

  const handleDuplicateResume = (id: string) => {
    console.log('Duplicate resume:', id)
  }

  const handleExportPdf = (id: string) => {
    fetch('export/'+id)
    .then(
      async res => {
        if(res.body !== null){
          const reader = res.body.getReader();
          return new ReadableStream({
            start(controller) {
              return pump();
              function pump() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  return pump();
                });
              }
            },
          });
        }
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob as unknown as BlobPart], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `cv-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  }
      

  const handleDeleteResume = (id: string) => {
    console.log('Delete resume:', id)
  }

  const handleOpenResume = (id: string) => {
    console.log('Open resume:', id)
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 pb-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, Katrin!! 👋
              </h1>
            </div>
            <SectionCards />
            <ResumeGrid
              resumes={mockResumes}
              onCreateNew={handleCreateNew}
              onEditResume={handleEditResume}
              onShareResume={handleShareResume}
              onDuplicateResume={handleDuplicateResume}
              onExportPdf={handleExportPdf}
              onDeleteResume={handleDeleteResume}
              onOpenResume={handleOpenResume}
            />
          </div>
        </div>
      </div>
    </>
  )
}
