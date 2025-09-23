"use client";

import {
  IconCirclePlusFilled,
  IconChevronDown,
  IconPlus,
  type Icon,
} from "@tabler/icons-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { shallow } from "zustand/shallow";
import { CvData } from "@/schemas/cv_data_schema";
import { useToast } from "@/hooks/use-toast";
import { useCvStore } from "@/stores/cv_store";
import { ResumeCardMenu } from "@/components/custom/resume-card-menu";
import { ShareModal } from "@/components/custom/share-modal";
import { DeleteCvModal } from "@/components/custom/delete-cv-modal";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  createEmptyCv,
  deleteCv as deleteCvService,
  handleExportPdf,
} from "@/services/cv_data.service";
import { Button } from "./ui/button";

type NavItem = { title: string; url: string; icon?: Icon; isActive?: boolean };
type ResumesItem = { title: string; url: string; icon?: Icon };

export function NavMain({
  items,
  resumes,
}: {
  items: NavItem[];
  resumes?: ResumesItem;
}) {
  // ---- Store selectors (stable) ----
  const fetchAll = useCvStore((s) => s.fetchAll); // fn is stable
  const duplicate = useCvStore((s) => s.duplicateOne); // fn is stable
  const cvDataList = useCvStore((s) => s.remoteItems ?? []) as CvData[];

  // ---- Local UI state ----
  const [isResumesOpen, setIsResumesOpen] = useState(true);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CvData | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [cvToShare, setCvToShare] = useState<CvData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // ---- Fetch once on mount (avoid toast as dep) ----
  useEffect(() => {
    fetchAll().catch(() => {
      // call toast inside, but don't depend on it
      try {
        toast.error("Failed to load resumes");
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---- Sorted list: oldest -> newest (new items at end) ----
  const sortedCvs = useMemo(() => {
    if (!cvDataList || cvDataList.length === 0) return [];
    const arr = cvDataList.slice();
    arr.sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() -
        new Date(b.createdAt ?? 0).getTime()
    );
    return arr;
  }, [cvDataList]);

  // ---- Stagger delays must match sorted list ----
  const delays = useMemo(
    () =>
      sortedCvs.map((_, i) =>
        isResumesOpen ? i * 35 : (sortedCvs.length - 1 - i) * 35
      ),
    [sortedCvs, isResumesOpen]
  );

  // ---- Handlers (memoized) ----
  const onCreate = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault?.();
      setSelectedCvId(null);
      try {
        await createEmptyCv();
        await fetchAll();
      } catch {
        toast.error("Failed to create resume");
      }
    },
    [fetchAll, toast]
  );

  const onRemove = useCallback(async () => {
    if (!cvToDelete?.id) return;
    try {
      setDeleteDialogOpen(false);
      await deleteCvService(cvToDelete.id);
      await fetchAll();
    } catch {
      toast.error("Failed to delete CV");
    } finally {
      setCvToDelete(null);
    }
  }, [cvToDelete, fetchAll, toast]);

  const openShareModal = useCallback((cv: CvData) => {
    const url = `${window.location.origin}/view/${cv.id}`;
    setCvToShare(cv);
    setShareUrl(url);
    setLinkCopied(false);
    setShareDialogOpen(true);
  }, []);

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
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <form onSubmit={onCreate} className="w-full">
              <SidebarMenuButton
                tooltip="Create new CV"
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-8 duration-200 hover:text-primary-foreground"
              >
                <IconCirclePlusFilled />
                <span>New Resume</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className="!bg-transparent hover:!bg-primary/10"
                >
                  <Link href={item.url} onClick={() => setSelectedCvId(null)}>
                    {item.icon && <item.icon />}
                    <span className={isActive ? "font-bold" : ""}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {resumes && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setIsResumesOpen((v) => !v);
                  setSelectedCvId(null);
                }}
                aria-expanded={isResumesOpen}
                className="w-full justify-between hover:!bg-primary/10"
              >
                <div className="flex items-center gap-2">
                  {resumes.icon && <resumes.icon className="h-4 w-4" />}
                  <span>{resumes.title}</span>
                </div>
                <IconChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isResumesOpen ? "rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isResumesOpen
                    ? "max-h-[70vh] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <SidebarMenuSub className="mx-0 px-0 gap-0.5">
                  {sortedCvs.length > 0 ? (
                    <>
                      {sortedCvs.map((cv, index) => {
                        const isActiveCv = selectedCvId === cv.id?.toString();
                        return (
                          <SidebarMenuSubItem
                            key={cv.id}
                            className={`relative ml-6 overflow-x-hidden transition-all duration-300 ease-out ${
                              isResumesOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2"
                            }`}
                            style={{ transitionDelay: `${delays[index]}ms` }}
                          >
                            <div
                              className={`group/item flex items-start w-full hover:bg-primary/10 rounded-md transition-colors ${
                                isActiveCv ? "bg-primary/10" : ""
                              }`}
                            >
                              <Button
                                variant="ghost"
                                className="flex items-center flex-1 pl-2 py-1 min-h-8 hover:bg-transparent justify-start"
                                onClick={() => {
                                  router.push("/editor/" + cv.id);
                                  setSelectedCvId(cv.id?.toString() || null);
                                }}
                              >
                                <span
                                  className={`text-sm truncate max-w-[150px] ${isActiveCv ? "font-bold" : ""}`}
                                  title={cv.name?.trim()}
                                >
                                  {cv.name?.trim()}
                                </span>
                              </Button>

                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity py-1 pr-2 flex items-center justify-center">
                                <ResumeCardMenu
                                  onEdit={() => router.push(`/editor/${cv.id}`)}
                                  onShare={() => openShareModal(cv)}
                                  onDuplicate={async () => {
                                    try {
                                      if (cv.id) {
                                        await duplicate(cv.id);
                                        await fetchAll();
                                      }
                                    } catch {
                                      toast.error("Failed to duplicate CV");
                                    }
                                  }}
                                  onExportPdf={() => {
                                    try {
                                      if (cv.id) handleExportPdf(cv);
                                    } catch {
                                      toast.error("Failed to export PDF");
                                    }
                                  }}
                                  onDelete={() => {
                                    setCvToDelete(cv);
                                    setDeleteDialogOpen(true);
                                  }}
                                />
                              </div>
                            </div>
                          </SidebarMenuSubItem>
                        );
                      })}

                      <SidebarMenuSubItem className="w-full">
                        <form onSubmit={onCreate} className="flex w-full">
                          <div className="p-3" />
                          <button
                            type="submit"
                            className="flex items-center justify-center py-1 min-h-8 text-foreground hover:bg-primary/10 rounded-md transition-colors w-full text-gray-400 hover:text-gray-900"
                          >
                            <IconPlus className="h-4 w-4" />
                          </button>
                        </form>
                      </SidebarMenuSubItem>
                    </>
                  ) : (
                    <>
                      <SidebarMenuSubItem>
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          No Resumes Found
                        </div>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem className="ml-6">
                        <form onSubmit={onCreate}>
                          <button
                            type="submit"
                            className="flex items-center justify-start pl-2 pr-2 py-1 min-h-8 text-foreground hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <IconPlus className="h-4 w-4" />
                          </button>
                        </form>
                      </SidebarMenuSubItem>
                    </>
                  )}
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>

      <ShareModal
        isOpen={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        cv={cvToShare ?? null}
        shareUrl={shareUrl}
        linkCopied={linkCopied}
        onCopyLink={copyShareLink}
        onShareEmail={shareViaEmail}
      />

      <DeleteCvModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cv={cvToDelete ?? null}
        onDelete={onRemove}
      />
    </SidebarGroup>
  );
}
