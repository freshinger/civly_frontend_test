"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

// --- Store ---
import { useCvStore } from "@/stores/cv_store";

// --- Services ---
import {
  updateCVName,
  fetchCv,
  updateVisibility,
  deleteCv,
  handleExportPdf,
} from "@/services/cv_data.service";
import type { CvData } from "@/schemas/cv_data_schema";

// --- Local Components ---
import { VisibilityModal } from "./visibility-modal";
import { ShareModal } from "@/components/custom/share-modal";
import { DeleteCvModal } from "@/components/custom/delete-cv-modal";

// --- Shadcn UI & Icon Imports ---
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";
import {
  IconPencil,
  IconLock,
  IconLockOpen,
  IconCheck,
  IconX,
  IconShare,
  IconFileTypePdf,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

// --- Type Definitions  ---
type SaveStatus = "Saved" | "Saving..." | "Unsaved Changes" | "Error";
export type Visibility = "Public" | "Private" | "Draft";

// --- The Main Header Component ---
export function EditorHeader({
  cvId = "dummy",
  rightSidebarOpen,
  setRightSidebarOpen,
}: {
  cvId?: string;
  rightSidebarOpen?: boolean;
  setRightSidebarOpen?: (open: boolean) => void;
}) {
  // --- Store (robust selector in case field name differs) ---
  const cvs = useCvStore(
    (s) => (s.remoteItems ?? (s as any).remoteItems ?? []) as CvData[]
  );

  // --- State Management ---
  const [currentCv, setCurrentCv] = useState<CvData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [cvName, setCvName] = useState("Resume");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();

  // Load CV from server
  useEffect(() => {
    let alive = true;
    const loadCV = async () => {
      if (cvId === "dummy") {
        if (!alive) return;
        setCurrentCv(null);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const cv = await fetchCv(cvId);
        if (!alive) return;
        setCurrentCv(cv ?? null);
        setCvName((cv?.name ?? "Resume").trim() || "Resume");
      } catch {
        if (!alive) return;
        setCurrentCv(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    loadCV();
    return () => {
      alive = false;
    };
  }, [cvId]);

  // Compute visibility once
  const visibility: Visibility = useMemo(() => {
    const v = currentCv?.visibility;
    return v === "public" ? "Public" : v === "private" ? "Private" : "Draft";
  }, [currentCv?.visibility]);

  // Visibility change
  const handleVisibilityChange = useCallback(
    async (newVisibility: Visibility, newPassword?: string) => {
      if (!currentCv) return;
      const schemaVisibility =
        newVisibility === "Public"
          ? ("public" as const)
          : newVisibility === "Private"
            ? ("private" as const)
            : ("draft" as const);
      try {
        setSaveStatus("Saving...");
        // Update server (extend service to accept password if needed)
        await updateVisibility(currentCv, schemaVisibility, newPassword);
        setCurrentCv({
          ...currentCv,
          visibility: schemaVisibility,
          password:
            schemaVisibility === "private" ? newPassword || "" : undefined,
        });
        setSaveStatus("Saved");
      } catch (e) {
        console.error("Error updating visibility", e);
        setSaveStatus("Error");
      }
    },
    [currentCv]
  );

  // Share
  const handleShare = useCallback(() => {
    if (!currentCv?.id) return;
    const url = `${window.location.origin}/view/${currentCv.id}`;
    setShareUrl(url);
    setLinkCopied(false);
    setIsShareModalOpen(true);
  }, [currentCv?.id]);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  }, [shareUrl]);

  const shareViaEmail = useCallback(() => {
    const name = (currentCv?.name || "My CV").trim() || "My CV";
    const subject = `Check out my CV: ${name}`;
    const body = `Hi,

I wanted to share my CV with you.

🔗 Link: ${shareUrl}

Best regards`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  }, [currentCv?.name, shareUrl]);

  // Delete
  const handleDelete = useCallback(async () => {
    if (!currentCv?.id) return;
    try {
      setDeleteDialogOpen(false);
      await deleteCv(currentCv.id);
      router.push("/dashboard");
    } catch (e) {
      console.error("Delete error", e);
    }
  }, [currentCv?.id, router]);

  // Name editing
  const handleNameSave = useCallback(async () => {
    if (!currentCv?.id) {
      setIsEditingName(false);
      return;
    }
    const next = cvName.trim();
    if (!next || next === currentCv.name) {
      setIsEditingName(false);
      setCvName(currentCv.name || "Resume");
      return;
    }
    setIsEditingName(false);
    const prev = currentCv.name;
    setSaveStatus("Saving...");
    setCurrentCv({ ...currentCv, name: next });
    try {
      await updateCVName(currentCv.id, next);
      setSaveStatus("Saved");
    } catch (e) {
      console.error("Error updating CV name", e);
      setCurrentCv({ ...currentCv, name: prev });
      setCvName(prev || "Resume");
      setSaveStatus("Error");
    }
  }, [currentCv, cvName]);

  const handleNameCancel = useCallback(() => {
    setCvName(currentCv?.name || "Resume");
    setIsEditingName(false);
  }, [currentCv?.name]);

  const badgeTone: Record<SaveStatus, string> = {
    Saved: "bg-green-50 border-green-200 text-green-800",
    "Saving...": "bg-blue-50 border-blue-200 text-blue-800",
    "Unsaved Changes": "bg-orange-50 border-orange-200 text-orange-800",
    Error: "bg-red-50 border-red-200 text-red-800",
  };

  // --- Render states with stable height ---
  if (isLoading) {
    return (
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-[50px]">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <span className="text-md font-semibold text-gray-500">
            Loading CV...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 font-medium border ${badgeTone["Saving..."]}`}
          >
            Loading...
          </Badge>
        </div>
      </header>
    );
  }

  if (!currentCv && cvId !== "dummy") {
    return (
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-[50px]">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <span className="text-md font-semibold text-gray-500">
            CV not found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 font-medium border ${badgeTone["Error"]}`}
          >
            Error
          </Badge>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white relative z-50 h-[50px]">
        {/* Left: Sidebar + Save status */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="relative z-[60]" />
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 font-medium border ${badgeTone[saveStatus]}`}
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
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") handleNameCancel();
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

        {/* Right: Visibility + actions + right panel toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-sm"
            onClick={() => setIsVisibilityModalOpen(true)}
          >
            {visibility === "Public" ? (
              <IconLockOpen size={14} />
            ) : (
              <IconLock size={14} />
            )}
            {visibility}
          </Button>

          <div className="flex items-center gap-1 px-2 border-l border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
              title="Share CV"
            >
              <IconShare size={16} className="text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={async () => {
                if (!currentCv) return;
                try {
                  await handleExportPdf(currentCv);
                } catch (e) {
                  console.error("Export error", e);
                }
              }}
              title="Export as PDF"
            >
              <IconFileTypePdf size={16} className="text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDeleteDialogOpen(true)}
              title="Delete CV"
            >
              <IconTrash size={16} className="text-gray-600" />
            </Button>
          </div>

          {setRightSidebarOpen && (
            <div className="flex items-center pl-2 border-l border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                title={
                  rightSidebarOpen ? "Hide right panel" : "Show right panel"
                }
              >
                <PanelLeftIcon
                  size={16}
                  className={rightSidebarOpen ? "rotate-180" : ""}
                />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Visibility Modal */}
      <VisibilityModal
        isOpen={isVisibilityModalOpen}
        onOpenChange={setIsVisibilityModalOpen}
        visibility={visibility}
        password={currentCv?.password || ""}
        onVisibilityChange={handleVisibilityChange}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        cv={currentCv ?? cvs[0] ?? null}
        shareUrl={shareUrl}
        linkCopied={linkCopied}
        onCopyLink={copyShareLink}
        onShareEmail={shareViaEmail}
      />

      {/* Delete CV Modal */}
      <DeleteCvModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cv={currentCv ?? cvs[0] ?? null}
        onDelete={handleDelete}
      />
    </>
  );
}
