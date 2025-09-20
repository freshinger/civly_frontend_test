"use client";

import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { ResumeGrid } from '@/components/custom/resume-grid'
import { createEmptyCv, duplicateCv, handleExportPdf } from '@/services/cv_data.service'
import { useRouter } from 'next/navigation'
import { useCVListStore } from '@/providers/cvListProvider'
import { useEffect, useState } from 'react'
import { CvData } from '@/schemas/cv_data_schema'
import router from 'next/router';

export default function Page() {

  const router = useRouter()

  const { updateList, getCVS } = useCVListStore(
    (state) => state,
  )
  const [cvs, setCVS] = useState<CvData[]>([])


  const handleExportPdf = (id: string) => {
    fetch("export/" + id)
      .then(async (res) => {
        if (res.body !== null) {
          const reader = res.body.getReader();
          return new ReadableStream({
            start(controller) {
              return pump();
              function pump(): Promise<void> {
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
        const url = window.URL.createObjectURL(
          new Blob([blob as unknown as BlobPart], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `cv-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

    createEmptyCv().then(() => {
      router.refresh()
    })
  }

  const handleEditResume = (cv: CvData) => {
    console.log('Edit resume:', cv.id)
  }

  const handleShareResume = (cv: CvData) => {
    console.log('Share resume:', cv.id)
  }

  const handleDuplicateResume = (cv: CvData) => {
    if(cv.id){
      duplicateCv(cv.id).then(() => {
        router.refresh()
      })
    }
  }

  const handleDeleteResume = (cv: CvData) => {
    console.log('Delete resume:', cv.id)
  }

  const handleOpenResume = (cv: CvData) => {
    router.push('cv-preview/'+cv.id)
  }


  useEffect(() => {
    updateList().then((data) => {
      setCVS(getCVS())
    }
    )
  }, [])

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 pb-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, Katrin! 👋
              </h1>
            </div>

            <SectionCards />
            <ResumeGrid
              resumes={cvs}
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
  );
}
