"use client";

import {
  IconCirclePlusFilled,
  IconChevronDown,
  IconPlus,
  type Icon,
} from "@tabler/icons-react";
import { Trash2, Copy, ExternalLink, Mail } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CvData } from "@/schemas/cv_data_schema";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ResumeCardMenu } from "@/components/custom/resume-card-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { handleExportPdf } from "@/services/cv_data.service";
import { useCvStore } from "@/stores/cv_store";
import { PersonalInformation } from "@/schemas/personal_information_schema";

export function NavMain({
  items,
  resumes,
  cvs,
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
  cvs: CvData[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteOne } = useCvStore();
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

  // Cascade effect for "My Resumes" section
  useEffect(() => {
    if (cvs.length > 0) {
      if (isResumesOpen) {
        // Opening: Show items progressively with cascade
        setDisappearingCvs(new Set()); // Clear any disappearing state
        cvs.forEach((_, index) => {
          setTimeout(() => {
            setVisibleCvs((prev) => new Set([...prev, index]));
          }, index * 35); // Faster, smoother cascade
        });
      } else {
        // Closing: Hide items in reverse cascade (last item disappears first)
        setVisibleCvs(new Set()); // Clear visible state immediately
        cvs
          .slice()
          .reverse()
          .forEach((_, reverseIndex) => {
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
  }, [isResumesOpen, cvs]);

  // Create a new blank CV
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedCvId(null); // Clear any selected CV

    try {
      const supabase = await createClient();
      await supabase.functions.invoke("cv-data/", {
        body: { name: "Resume" },
      });
      toast.success("New CV created successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Failed to create new CV");
    }
  }

  const deleteCv = async () => {
    if (!cvToDelete || !cvToDelete.id) return;

    try {
      setDeleteDialogOpen(false);
      await deleteOne(cvToDelete.id);
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

  // Function to get CV display name
  const getCvDisplayName = (cv: CvData) => {
    // First priority: use the CV name field if it exists
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

  if (resumes) {
    const resumesNew = resumes;
    resumesNew.items = cvs;
  }

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
                className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                  isResumesOpen
                    ? "max-h-[70vh] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <SidebarMenuSub className="mx-0 px-0 gap-0.5">
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
                            className={`relative transition-all duration-300 ease-out ml-6 ${
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
                              <Link
                                href={"/editor"}
                                className="flex items-center flex-1 pl-2 py-1 min-h-8"
                                onClick={() =>
                                  setSelectedCvId(cv.id?.toString() || null)
                                }
                              >
                                <span
                                  className={`text-sm ${
                                    isActiveCv ? "font-bold" : ""
                                  }`}
                                >
                                  {getCvDisplayName(cv)}
                                </span>
                              </Link>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity py-1 pr-2 flex items-center justify-center">
                                <ResumeCardMenu
                                  onEdit={() => {
                                    // Navigate to edit mode
                                    router.push(`/editor`);
                                  }}
                                  onShare={async () => {
                                    openShareModal(cv);
                                  }}
                                  onDuplicate={async () => {
                                    try {
                                      // TODO: Implement actual duplicate functionality
                                      toast.info(
                                        "Duplicate feature coming soon!"
                                      );
                                      console.log("Duplicate CV:", cv.id);
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
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <ExternalLink className="h-5 w-5" />
              Share CV: {cvToShare ? getCvDisplayName(cvToShare) : ""}
            </DialogTitle>
            <DialogDescription>
              Share your professional CV with recruiters, colleagues, or
              potential employers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Share Link Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-primary/5 border-primary/20 text-sm font-mono"
                />
                <Button
                  onClick={copyShareLink}
                  variant={linkCopied ? "default" : "outline"}
                  size="sm"
                  className={`shrink-0 ${
                    linkCopied
                      ? "bg-primary hover:bg-primary/90"
                      : "border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  {linkCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Link copied to clipboard successfully!
                </p>
              )}
            </div>

            {/* Share Methods Section */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-foreground mb-3">
                Share via:
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="justify-start h-auto p-4 border-primary/20 hover:bg-primary/5 hover:border-primary"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground">
                        Send via your email client with a professional message
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-1 rounded-full mt-0.5">
                  <ExternalLink className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    Sharing Settings
                  </p>
                  <p className="text-sm text-primary/80 mt-1">
                    This CV is currently public. Anyone with this link can view
                    your CV.
                  </p>
                  {/* TODO: Implement CV privacy settings - show different message for private CVs */}
                  {/* TODO: Add "Make Private" button here when password protection is implemented */}
                  <p className="text-xs text-primary/60 mt-2 italic">
                    💡 Tip: Password protection for private CV sharing coming
                    soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete CV
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the CV{" "}
              <strong>{cvToDelete ? getCvDisplayName(cvToDelete) : ""}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-destructive/20 p-1 rounded-full mt-0.5">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ Permanent Deletion Warning
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    This CV and all its data will be permanently removed from
                    your account. This action cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCvToDelete(null);
              }}
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteCv}
              className="bg-destructive hover:bg-destructive/90 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
