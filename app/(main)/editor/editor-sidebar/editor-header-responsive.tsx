"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconPencil,
  IconLock,
  IconLockOpen,
  IconX,
  IconShare,
  IconFileTypePdf,
  IconTrash,
  IconDotsVertical,
  IconCircleCheck,
  IconLoader2,
  IconAlertTriangle,
  IconClockHour4,
} from "@tabler/icons-react";
import { useMediaQuery } from "usehooks-ts";
import { useSheetStore } from "@/stores/sheet_store";
import {
  fetchCv,
  updateCVName,
  updateVisibility,
  handleExportPdf,
} from "@/services/cv_data.service";
import type { CvData } from "@/schemas/cv_data_schema";

type SaveStatus = "Saved" | "Saving..." | "Unsaved Changes" | "Error";
export type Visibility = "Public" | "Private" | "Draft";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

function StatusIcon({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { Icon: IconType; cls: string }> = {
    Saved: { Icon: IconCircleCheck, cls: "text-green-600" },
    "Saving...": { Icon: IconLoader2, cls: "text-blue-600 animate-spin" },
    "Unsaved Changes": { Icon: IconClockHour4, cls: "text-amber-600" },
    Error: { Icon: IconAlertTriangle, cls: "text-red-600" },
  };
  const { Icon, cls } = map[status];
  return (
    <span
      className="inline-flex items-center"
      aria-live="polite"
      title={status}
    >
      <Icon size={18} className={cls} />
      <span className="sr-only">{status}</span>
    </span>
  );
}

export function EditorHeaderResponsive({ cvId = "dummy" }: { cvId?: string }) {
  const [currentCv, setCurrentCv] = React.useState<CvData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [cvName, setCvName] = React.useState("Resume");
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("Saved");

  const isTablet = useMediaQuery("(max-width: 1260px)");
  const hideEditor = useSheetStore((s) => s.hideEditor);

  // Load CV
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!cvId || cvId === "dummy") {
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
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cvId]);

  const visibility: Visibility =
    currentCv?.visibility === "public"
      ? "Public"
      : currentCv?.visibility === "private"
        ? "Private"
        : "Draft";

  const handleVisibilityChange = async (
    newVisibility: Visibility,
    newPassword?: string
  ) => {
    if (!currentCv) return;
    const v =
      newVisibility === "Public"
        ? "public"
        : newVisibility === "Private"
          ? "private"
          : "draft";
    try {
      setSaveStatus("Saving...");
      await updateVisibility(currentCv, v, newPassword);
      setCurrentCv({
        ...currentCv,
        visibility: v,
        password: v === "private" ? newPassword || "" : undefined,
      });
      setSaveStatus("Saved");
    } catch {
      setSaveStatus("Error");
    }
  };

  const handleShare = () => {
    if (!currentCv?.id) return;
    const url = `${window.location.origin}/view/${currentCv.id}`;
    console.log("Share URL:", url);
  };

  const handleNameSave = async () => {
    if (!currentCv?.id) return setIsEditingName(false);
    const next = cvName.trim();
    if (!next || next === currentCv.name) {
      setIsEditingName(false);
      setCvName(currentCv.name || "Resume");
      return;
    }
    const prev = currentCv.name;
    setIsEditingName(false);
    setSaveStatus("Saving...");
    setCurrentCv({ ...currentCv, name: next });
    try {
      await updateCVName(currentCv.id, next);
      setSaveStatus("Saved");
    } catch {
      setCurrentCv({ ...currentCv, name: prev });
      setCvName(prev || "Resume");
      setSaveStatus("Error");
    }
  };

  return (
    <header className="flex h-[50px] w-full min-w-0 flex-shrink-0 items-center justify-between bg-white p-3">
      <div className="flex items-center gap-2 mr-2">
        <div className="hidden md:flex">
          <StatusIcon status={isLoading ? "Saving..." : saveStatus} />
        </div>
        {isTablet && (
          <Button
            type="button"
            variant="ghost"
            className="md:hidden h-8 w-8"
            onClick={hideEditor}
            aria-label="Close editor"
          >
            <IconX size={18} />
          </Button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 md:justify-start">
        {isEditingName ? (
          <div className="flex min-w-0 items-center gap-2">
            <Input
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleNameSave();
                if (e.key === "Escape") {
                  setCvName(currentCv?.name || "Resume");
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="h-9 text-md font-semibold"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNameSave}
              aria-label="Save name"
            >
              <IconCircleCheck size={16} className="text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditingName(false)}
              aria-label="Cancel"
            >
              <IconX size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-md font-semibold">{cvName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditingName(true)}
              aria-label="Edit name"
            >
              <IconPencil size={16} />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-sm"
            onClick={() => handleVisibilityChange(visibility)}
          >
            {visibility === "Public" ? (
              <IconLockOpen size={14} />
            ) : (
              <IconLock size={14} />
            )}
            {visibility}
          </Button>

          <div className="flex items-center gap-1 px-2 border-l">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
              title="Share CV"
            >
              <IconShare size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => currentCv && handleExportPdf(currentCv)}
              title="Export as PDF"
            >
              <IconFileTypePdf size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Delete CV"
            >
              <IconTrash size={16} />
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <IconDotsVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleVisibilityChange(visibility)}
              >
                {visibility === "Public" ? (
                  <IconLockOpen size={16} className="mr-2" />
                ) : (
                  <IconLock size={16} className="mr-2" />
                )}
                Visibility: {visibility}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShare}>
                <IconShare size={16} className="mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentCv && handleExportPdf(currentCv)}
              >
                <IconFileTypePdf size={16} className="mr-2" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <IconTrash size={16} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
