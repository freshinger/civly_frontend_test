"use client";

import { AppBar } from "@/components/appBar";
import { ResumeGrid } from "@/components/custom/resume-grid";
import { createEmptyCv, duplicateCv } from "@/services/cv_data.service";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CvData } from "@/schemas/cv_data_schema";
import { useUserProfile } from "@/hooks/use-user-profile";
import { getDisplayName } from "@/services/user-profile.service";
import { useCvStore } from "@/stores/cv_store";
import { LoadingStatus } from "@/types/LoadingStatus";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";
import { DeleteCvModal } from "@/components/custom/delete-cv-modal";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/custom/share-modal";

export default function Page() {
  const { toast } = useToast();
  const fetchAll = useCvStore((s) => s.fetchAll);
  const remove = useCvStore((s) => s.deleteOne);
  const [cvDataList, setCvDataList] = useState<CvData[] | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Loading
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CvData | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [cvToShare, setCvToShare] = useState<CvData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const isTablet = useMediaQuery("(max-width: 1000px)");
  const router = useRouter();
  const { profile } = useUserProfile();
  const userName = getDisplayName(profile);

  useEffect(() => {
    const unsubscribe = useCvStore.subscribe((state) => {
      setCvDataList(state.remoteItems);
    });

    fetchAll()
      .then(() => setLoadingStatus(LoadingStatus.Loaded))
      .catch(() => setLoadingStatus(LoadingStatus.Error));

    return () => unsubscribe();
  }, [fetchAll]);

  const handleCreateNew = async () => {
    setLoadingStatus(LoadingStatus.Loading);
    await createEmptyCv();
    setLoadingStatus(LoadingStatus.Loaded);
  };

  const handleExportPdf = async (cv: CvData) => {
    const res = await fetch(`/export/${cv.id}`);
    if (!res.body) return;

    const reader = res.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        const pump = (): Promise<void> =>
          reader.read().then(({ done, value }) => {
            if (done) return controller.close();
            controller.enqueue(value);
            return pump();
          });
        return pump();
      },
    });

    const response = new Response(stream);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cv-${cv.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleEditResume = (cv: CvData) => router.push(`/editor/${cv.id}`);
  const handleOpenResume = (cv: CvData) => router.push(`/cv-preview/${cv.id}`);

  const openShareModal = useCallback((cv: CvData) => {
    const url = `${window.location.origin}/view/${cv.id}`;
    setCvToShare(cv);
    setShareUrl(url);
    setLinkCopied(false);
    setIsShareModalOpen(true);
  }, []);

  const handleShareResume = (cv: CvData) => {
    openShareModal(cv);
  };

  const handleDuplicateResume = async (cv: CvData) => {
    if (!cv.id) return;
    setLoadingStatus(LoadingStatus.Loading);
    await duplicateCv(cv.id);
    setLoadingStatus(LoadingStatus.Loaded);
  };

  const handleDeleteResume = async (cv: CvData) => {
    if (!cv) return;
    setCvToDelete(cv);
    setDeleteDialogOpen(true);
  };

  const onRemove = useCallback(async () => {
    if (!cvToDelete?.id) return;
    try {
      setDeleteDialogOpen(false);
      await remove(cvToDelete.id);
      await fetchAll();
    } catch {
      toast.error("Failed to delete CV");
    } finally {
      setCvToDelete(null);
    }
  }, [cvToDelete, fetchAll, toast]);
  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied");
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [shareUrl, toast]);

  const shareViaEmail = useCallback(() => {
    const cvName = cvToShare?.name?.trim() || "My CV";
    const subject = `Check out my CV: ${cvName}`;
    const body = `Hi,

I wanted to share my CV with you.

CV: ${cvName}
Link: ${shareUrl}

Best regards`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
    toast.success("Email client opened");
  }, [cvToShare, shareUrl, toast]);

  return (
    <>
      {isTablet && (
        <AppBar showEditorButton={false}>
          <Image
            src="/civly-logo.svg"
            alt="CIVLY Logo"
            height={25}
            width={80}
            priority
          />
        </AppBar>
      )}
      <div className=" w-full   max-w-[1200px] mx-auto ">
        {loadingStatus === LoadingStatus.Error && (
          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Error loading resumes
            </h1>
          </div>
        )}
        {loadingStatus === LoadingStatus.Loaded && (
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 pb-3 lg:px-6">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Welcome back, {userName}! 👋
                  </h1>
                </div>

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
        )}
      </div>
      <DeleteCvModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cv={cvToDelete ?? null}
        onDelete={onRemove}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        cv={cvToShare ?? null}
        shareUrl={shareUrl}
        linkCopied={linkCopied}
        onCopyLink={copyShareLink}
        onShareEmail={shareViaEmail}
      />
    </>
  );
}
