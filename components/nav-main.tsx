"use client";

import {
  IconCirclePlusFilled,
  IconChevronDown,
  IconPlus,
  type Icon,
} from "@tabler/icons-react";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CvData } from "@/schemas/cv_data_schema";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/utils/supabase/client";
import {
  createEmptyCv,
  deleteCv,
  duplicateCv,
  handleExportPdf,
} from "@/services/cv_data.service";
import { PersonalInformation } from "@/schemas/personal_information_schema";
import { Button } from "./ui/button";
import { useCVListStore } from "@/providers/cvListProvider";

export function NavMain({
  items,
  resumes,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
  }[];
  resumes?: {
    title: string;
    url: string;
    icon?: Icon;
    items: CvData[];
  };
}) {
  const router = useRouter();
  const { toast } = useToast();

  const { updateList, getCVS } = useCVListStore((state) => state);
  const [cvs, setCVS] = useState<CvData[]>([]);
  const [isResumesOpen, setIsResumesOpen] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  // State for cascade animation effects
  const [visibleCvs, setVisibleCvs] = useState<Set<number>>(new Set());
  const [disappearingCvs, setDisappearingCvs] = useState<Set<number>>(
    new Set()
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CvData | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [cvToShare, setCvToShare] = useState<CvData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const pathname = usePathname();

  function refresh() {
    updateList().then((data) => {
      setCVS(getCVS());
      if (resumes) {
        resumes.items = data;
      }
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  // Cascade effect for "My Resumes" section
  useEffect(() => {
    if (cvs && cvs.length > 0) {
      if (isResumesOpen) {
        // Opening: Show items progressively with cascade
        setDisappearingCvs(new Set()); // Clear any disappearing state
        cvs.forEach((_: CvData, index: number) => {
          setTimeout(() => {
            setVisibleCvs((prev) => new Set([...prev, index]));
          }, index * 35); // Faster, smoother cascade
        });
      } else {
        // Closing: Hide items in reverse cascade (last item disappears first)
        setVisibleCvs(new Set()); // Clear visible state immediately
        if (cvs) {
          cvs
            .slice()
            .reverse()
            .forEach((_: CvData, reverseIndex: number) => {
              const originalIndex = cvs.length - 1 - reverseIndex;
              setTimeout(() => {
                setDisappearingCvs((prev) => new Set([...prev, originalIndex]));
              }, reverseIndex * 35); // Faster, smoother reverse cascade
            });
          // Clear disappearing state after animation completes
          setTimeout(
            () => {
              setDisappearingCvs(new Set());
            },
            cvs.length * 35 + 150
          ); // Adjusted cleanup timing
        }
      }
    }
  }, [isResumesOpen, cvs]);

  // Create a new blank CV
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedCvId(null); // Clear any selected CV

    try {
      await createEmptyCv();
      router.refresh();
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Failed to create new CV");
    }
  }

  const remove = async () => {
    if (!cvToDelete || !cvToDelete.id) return;

    try {
      setDeleteDialogOpen(false);
      await deleteCv(cvToDelete.id);
      toast.success("CV deleted successfully!");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete CV");
    } finally {
      setCvToDelete(null);
    }
  };

  const openShareModal = (cv: CvData) => {
    const url = `${window.location.origin}/view/${cv.id}`;
    setCvToShare(cv);
    setShareUrl(url);
    setLinkCopied(false);
    setShareDialogOpen(true);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareViaEmail = () => {
    const cvName = cvToShare ? getCvDisplayName(cvToShare) : "My CV";
    const subject = `Check out my CV: ${cvName}`;
    const body = `Hi,

I hope this message finds you well. I wanted to share my CV with you for your review.

📄 CV: ${cvName}
🔗 Link: ${shareUrl}

This link provides access to my current CV with all my professional experience, skills, and qualifications. Please feel free to download or share it as needed.

I'd be happy to discuss any opportunities or answer any questions you might have.

Best regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    toast.success("Email client opened with CV sharing message!");
  };

  // Simple function to get CV display name for list items
  const getCvDisplayName = (cv: CvData) => {
    // Always prioritize the document name (cv.name)
    console.log("getCvDisplayName called for CV:", cv.id, "name:", cv.name);
    if (cv.name && cv.name.trim()) {
      return cv.name.trim();
    }

    // Second priority: use personal information
    const personalInfo = cv.personalInformation || ({} as PersonalInformation);
    const name = personalInfo.name ?? "";
    const surname = personalInfo.surname ?? "";

    if (name || surname) {
      return `CV - ${name} ${surname}`.trim();
    }

    // Third priority: use email
    const email = personalInfo.email || "";
    if (email) {
      return `CV - ${email.split("@")[0]}`;
    }

    // Fallback to ID or date
    const dateStr = cv.createdAt
      ? new Date(cv.createdAt).toLocaleDateString()
      : "";
    return `CV - ${dateStr || cv.id?.toString().slice(0, 8)}`;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <form onSubmit={onSubmit} className="w-full">
              <SidebarMenuButton
                tooltip="Create new CV"
                type="submit"
                className="bg-primary text-primary-foreground  hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8  duration-200 ease-linear"
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

          {/* My Resumes Collapsible Item */}
          {resumes && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setIsResumesOpen(!isResumesOpen);
                  setSelectedCvId(null);
                }}
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
                className={`overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
                  isResumesOpen
                    ? "max-h-[70vh] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <SidebarMenuSub className="mx-0 px-0 gap-0.5 overflow-x-hidden">
                  {resumes && resumes.items && resumes.items.length > 0 ? (
                    <>
                      {resumes.items.map((cv, index) => {
                        // Only the selected CV is active
                        const isActiveCv = selectedCvId === cv.id?.toString();
                        const isVisible = visibleCvs.has(index);
                        const isDisappearing = disappearingCvs.has(index);

                        return (
                          <SidebarMenuSubItem
                            key={cv.id}
                            className={`relative transition-all duration-300 ease-out ml-6 overflow-x-hidden ${
                              isDisappearing
                                ? "opacity-0 scale-95 -translate-y-4 max-h-0 overflow-hidden transform" // Smoother disappearing with more movement
                                : isVisible
                                  ? "opacity-100 scale-100 translate-y-0 max-h-12 transform" // Visible state with transform
                                  : "opacity-0 scale-90 translate-y-2 max-h-0 overflow-hidden transform" // Hidden state with subtle positioning
                            }`}
                            style={{
                              transitionDelay: isDisappearing
                                ? "0ms" // No delay for disappearing items
                                : isVisible
                                  ? `${
                                      cvs.findIndex((c) => c.id === cv.id) * 20
                                    }ms` // Smoother staggered appearance
                                  : "0ms",
                            }}
                          >
                            <div
                              className={`group/item flex items-center w-full hover:bg-primary/10 rounded-md transition-colors ${
                                isActiveCv ? "bg-primary/10" : ""
                              }`}
                            >
                              <Button
                                variant="ghost"
                                className="flex items-center flex-1 pl-2 py-1 min-h-8 hover:bg-transparent"
                                onClick={() => {
                                  router.push("/editor/" + cv.id);
                                  setSelectedCvId(cv.id?.toString() || null);
                                }}
                              >
                                <span
                                  className={`text-sm ${
                                    isActiveCv ? "font-bold" : ""
                                  }`}
                                  title={getCvDisplayName(cv)}
                                >
                                  {getCvDisplayName(cv)}
                                </span>
                              </Button>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity py-1 pr-2 flex items-center justify-center">
                                <ResumeCardMenu
                                  onEdit={() => {
                                    // Navigate to edit mode
                                    router.push(`/editor/${cv.id}`);
                                  }}
                                  onShare={async () => {
                                    openShareModal(cv);
                                  }}
                                  onDuplicate={async () => {
                                    try {
                                      if (cv.id) {
                                        await duplicateCv(cv.id);
                                        router.refresh();
                                      }
                                    } catch (error) {
                                      console.error("Duplicate error:", error);
                                      toast.error("Failed to duplicate CV");
                                    }
                                  }}
                                  onExportPdf={async () => {
                                    try {
                                      if (cv.id) {
                                        handleExportPdf(cv.id);
                                      }
                                    } catch (error) {
                                      console.error("Export error:", error);
                                      toast.error("Failed to export PDF");
                                    }
                                  }}
                                  onDelete={async () => {
                                    // Open delete confirmation modal
                                    setCvToDelete(cv);
                                    setDeleteDialogOpen(true);
                                  }}
                                />
                              </div>
                            </div>
                          </SidebarMenuSubItem>
                        );
                      })}

                      {/* Add New Resume Button at the end of the list */}
                      <SidebarMenuSubItem className="ml-6">
                        <form onSubmit={onSubmit}>
                          <button
                            type="submit"
                            className="flex items-center justify-start pl-2 pr-2 py-1 min-h-8 text-foreground hover:bg-primary/10 rounded-md transition-colors"
                            title="Create new resume"
                            onClick={() => console.log("Button clicked!")}
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

                      {/* Add New Resume Button when no resumes exist */}
                      <SidebarMenuSubItem className="ml-6">
                        <form onSubmit={onSubmit}>
                          <button
                            type="submit"
                            className="flex items-center justify-start pl-2 pr-2 py-1 min-h-8 text-foreground hover:bg-primary/10 rounded-md transition-colors"
                            title="Create new resume"
                            onClick={() =>
                              console.log("Button clicked (no resumes)!")
                            }
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

      {/* CV Share Dialog */}
      {/* Share Modal */}
      <ShareModal
        isOpen={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        cv={cvToShare}
        shareUrl={shareUrl}
        linkCopied={linkCopied}
        onCopyLink={copyShareLink}
        onShareEmail={shareViaEmail}
      />

      {/* Delete CV Modal */}
      <DeleteCvModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cv={cvToDelete}
        onDelete={remove}
      />
    </SidebarGroup>
  );
}
