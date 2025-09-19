"use client";

import React, { useState, useEffect } from "react";

// --- Store ---
import { useCvStore } from "@/stores/cv_store";

// --- Local Components ---
import { VisibilityModal } from "./visibility-modal";
import { ShareModal } from "@/components/custom/share-modal";
import { ResumeCardMenu } from "@/components/custom/resume-card-menu";

// --- Shadcn UI & Icon Imports ---
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconPencil,
  IconLock,
  IconLockOpen,
  IconDeviceFloppy,
  IconWorld,
} from "@tabler/icons-react";

// --- Type Definitions  ---
type SaveStatus = "Saved" | "Saving..." | "Unsaved Changes" | "Error";
export type Visibility = "Public" | "Private" | "Draft";

// --- The Main Header Component ---
export function EditorHeader({ cvId = "dummy" }: { cvId?: string }) {
  // --- Store ---
  const { items: cvs } = useCvStore();

  // Find CV by ID, prioritize exact match, then fallback to dummy if no real CVs
  let currentCv = cvs.find((cv) => cv.id === cvId);

  // If not found and we have real CVs (not just dummy), use first real CV
  if (!currentCv && cvs.length > 1) {
    currentCv = cvs.find((cv) => cv.id !== "dummy") || cvs[0];
  }

  // Final fallback to any CV
  if (!currentCv && cvs.length > 0) {
    currentCv = cvs[0];
  }

  // Debug logs
  console.log(
    "EditorHeader - cvId:",
    cvId,
    "cvs length:",
    cvs.length,
    "currentCv:",
    currentCv?.id
  );

  // --- State Management ---
  const [isEditingName, setIsEditingName] = useState(false);
  const [cvName, setCvName] = useState(currentCv?.name || "Untitled Resume");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Update CV name when current CV changes
  useEffect(() => {
    if (currentCv?.name) {
      setCvName(currentCv.name);
    }
  }, [currentCv?.name]);

  // Get visibility directly from store
  const getVisibilityFromStore = (): Visibility => {
    if (currentCv?.visibility === "public") return "Public";
    if (currentCv?.visibility === "private") return "Private";
    return "Draft";
  };

  // Update local state when CV changes
  useEffect(() => {
    if (currentCv) {
      setCvName(currentCv.name || "Resume");
    }
  }, [currentCv]); // Handle visibility changes - update CV in store
  const handleVisibilityChange = async (
    newVisibility: Visibility,
    newPassword?: string
  ) => {
    if (!currentCv) return;

    // Map UI visibility to schema visibility
    const schemaVisibility =
      newVisibility === "Public"
        ? ("public" as const)
        : newVisibility === "Private"
          ? ("private" as const)
          : ("draft" as const);

    const updatedCv = {
      ...currentCv,
      visibility: schemaVisibility,
      password: newVisibility === "Private" ? newPassword || "" : undefined,
    };

    try {
      // Update directly in store - no local state needed
      const { saveLocally } = useCvStore.getState();
      saveLocally(updatedCv);

      setSaveStatus("Saved");

      // Show warning about local-only save
      console.warn(
        "Visibility changed locally only. Server sync is temporarily unavailable."
      );
    } catch (error) {
      console.error("Error updating CV visibility:", error);
      setSaveStatus("Error");
    }
  };

  // --- Share Functions ---
  const handleShare = () => {
    if (currentCv) {
      const url = `${window.location.origin}/view/${currentCv.id}`;
      setShareUrl(url);
      setLinkCopied(false);
      setIsShareModalOpen(true);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const shareViaEmail = () => {
    const cvName = currentCv?.name || "My CV";
    const subject = `Check out my CV: ${cvName}`;
    const body = `Hi,

I hope this message finds you well. I wanted to share my CV with you for your review.

🔗 Link: ${shareUrl}

This link provides access to my current CV with all my professional experience, skills, and qualifications. Please feel free to download or share it as needed.

Best regards`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  // --- Name Editing Functions ---
  const handleNameSave = async () => {
    console.log("handleNameSave called", { currentCv: currentCv?.id, cvName });
    console.log("Current CV full object:", currentCv);
    setIsEditingName(false);

    if (currentCv && cvName.trim()) {
      const updatedCv = {
        ...currentCv,
        name: cvName.trim(),
      };

      console.log("Saving CV with updated name:", updatedCv);

      try {
        setSaveStatus("Saving...");

        // Save locally first
        const { saveLocally, saveRemote } = useCvStore.getState();
        console.log("About to save locally...");
        saveLocally(updatedCv);
        console.log("Successfully saved locally");

        // Only save to server if it's not the dummy CV
        if (currentCv.id !== "dummy") {
          console.log("About to save to server...");
          await saveRemote(updatedCv);
          console.log("Successfully saved to server");
        } else {
          console.log("Skipping server save for dummy CV");
        }

        setSaveStatus("Saved");
        console.log("Save operation completed successfully");
      } catch (error) {
        console.error("Error updating CV name:", error);
        setSaveStatus("Error");
      }
    } else {
      console.log("Not saving - missing currentCv or cvName", {
        currentCv: !!currentCv,
        cvName,
        cvNameTrimmed: cvName.trim(),
      });
    }
  };

  const getSaveStatusBadgeVariant = () => {
    switch (saveStatus) {
      case "Saved":
        return "bg-green-50 border-green-200 text-green-800";
      case "Saving...":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "Unsaved Changes":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "Error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <>
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b bg-white z-10 h-16">
        {/* Left Side: Document Info & Status */}
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <Input
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave();
              }}
              autoFocus
              className="text-md font-semibold h-9"
            />
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
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 font-medium border ${getSaveStatusBadgeVariant()}`}
          >
            {saveStatus}
          </Badge>

          {/* This button both displays status and opens the VisibilityModal */}
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            onClick={() => setIsVisibilityModalOpen(true)}
          >
            {getVisibilityFromStore() === "Public" ? (
              <IconLockOpen size={14} />
            ) : (
              <IconLock size={14} />
            )}
            {getVisibilityFromStore()}
          </Button>
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          <Button
            onClick={() => handleNameSave()}
            disabled={saveStatus === "Saving..."}
            variant="outline"
            size="sm"
            className="h-auto px-3 py-2"
          >
            <IconDeviceFloppy size={16} className="mr-2" />
            Save
          </Button>

          {/* Publish Button */}
          <Button
            onClick={() => setIsVisibilityModalOpen(true)}
            size="sm"
            className="h-auto px-3 py-2"
          >
            <IconWorld size={16} className="mr-2" />
            Publish
          </Button>

          {/* Options Menu */}
          <ResumeCardMenu
            align="end"
            side="bottom"
            showEdit={false}
            onShare={handleShare}
            onExportPdf={() => {
              // TODO: Implementar export PDF
              console.log("Export PDF clicked");
            }}
            onDuplicate={() => {
              // TODO: Implementar duplicate
              console.log("Duplicate clicked");
            }}
            onDelete={() => {
              // TODO: Implementar delete
              console.log("Delete clicked");
            }}
          />
        </div>
      </header>

      {/* The Visibility Modal is rendered here */}
      <VisibilityModal
        isOpen={isVisibilityModalOpen}
        onOpenChange={setIsVisibilityModalOpen}
        visibility={getVisibilityFromStore()}
        password={currentCv?.password || ""}
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
  );
}
