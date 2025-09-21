"use client";

import { SiteHeader } from "@/components/site-header";
import { ResumeGrid } from "@/components/custom/resume-grid";
import {
  createEmptyCv,
  duplicateCv,
  handleExportPdf,
} from "@/services/cv_data.service";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CvData } from "@/schemas/cv_data_schema";
import router from "next/router";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getDisplayName } from "@/services/user-profile.service";
import { useCvStore } from "@/stores/cv_store";
import { LoadingStatus } from "@/types/LoadingStatus";

export default function Page() {
  const fetchAll = useCvStore((s) => s.fetchAll);
  const remove = useCvStore((s) => s.deleteOne);
  const [cvDataList, setCvDataList] = useState<CvData[] | null>(null);
  const subscribe = useCvStore.subscribe;

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Loading
  );

  useEffect(() => {
    subscribe((state) => {
      console.log("state change", state);
      setCvDataList(state.remoteItems);
    });
    fetchAll()
      .then(() => setLoadingStatus(LoadingStatus.Loaded))
      .catch(() => setLoadingStatus(LoadingStatus.Error));
  }, []);

  const router = useRouter();
  const { profile } = useUserProfile();
  const userName = getDisplayName(profile);

  const handleCreateNew = () => {
    createEmptyCv().then(() => {
      setLoadingStatus(LoadingStatus.Loading);
    });
  };

  const handleExportPdf = (cv: CvData) => {
    fetch("/export/" + cv.id)
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
        link.download = `cv-${cv.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });

    createEmptyCv().then(() => {
      //refresh()
      setLoadingStatus(LoadingStatus.Loading);
    });
  };

  const handleEditResume = (cv: CvData) => {
    router.push("/editor/" + cv.id);
  };

  const handleShareResume = (cv: CvData) => {
    //TODO: implement share dialog
    console.log("Share resume:", cv.id);
  };

  const handleDuplicateResume = (cv: CvData) => {
    if (cv.id) {
      duplicateCv(cv.id).then(() => {
        setLoadingStatus(LoadingStatus.Loading);
      });
    }
  };

  const handleDeleteResume = (cv: CvData) => {
    if (cv.id) {
      remove(cv.id).then(() => {
        setLoadingStatus(LoadingStatus.Loading);
      });
    }
  };

  const handleOpenResume = (cv: CvData) => {
    router.push("cv-preview/" + cv.id);
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 pb-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, {userName}! 👋
              </h1>
            </div>

            {/*<SectionCards />*/}
            <ResumeGrid
              resumes={cvDataList}
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
