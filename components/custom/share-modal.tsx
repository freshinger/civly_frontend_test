"use client";

import React from "react";
import { CvData } from "@/schemas/cv_data_schema";
import { useCvStore } from "@/stores/cv_store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  ExternalLink,
  Mail,
  Lock,
  Globe,
  AlertCircle,
} from "lucide-react";
import router from "next/router";

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cv: CvData | null;
  shareUrl: string;
  linkCopied: boolean;
  onCopyLink: () => void;
  onShareEmail: () => void;
}

export function ShareModal({
  isOpen,
  onOpenChange,
  cv,
  shareUrl,
  linkCopied,
  onCopyLink,
  onShareEmail,
}: ShareModalProps) {
  const { remoteitems } = useCvStore();

  if (!cv) return null;

  // Get the most up-to-date version of the CV from the store
  const currentCv = remoteitems.find((item) => item.id === cv.id) || cv;

  const isPublished =
    currentCv.visibility === "public" || currentCv.visibility === "private";
  const isPrivate = currentCv.visibility === "private";

  // Function to get CV display name
  const getCvDisplayName = (cv: CvData) => {
    // First priority: use the CV name field if it exists
    if (cv.name && cv.name.trim()) {
      return cv.name.trim();
    }

    // Second priority: use personal information
    const personalInfo = cv.personalInformation || {};
    const name = personalInfo.name || "";
    const surname = personalInfo.surname || "";

    if (name || surname) {
      return `CV - ${name} ${surname}`.trim();
    }

    // Third priority: use email
    const email = personalInfo.email || "";
    if (email) {
      return `CV - ${email.split("@")[0]}`;
    }

    // Fallback to ID or date
    const dateStr = currentCv.createdAt
      ? new Date(currentCv.createdAt).toLocaleDateString()
      : "";
    return `CV - ${dateStr || currentCv.id?.toString().slice(0, 8)}`;
  };

  // If not published, show publish prompt
  if (!isPublished) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              CV Not Published
            </DialogTitle>
            <DialogDescription>
              Your CV &ldquo;{getCvDisplayName(currentCv)}&rdquo; needs to be
              published before it can be shared.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-1 rounded-full mt-0.5">
                  <Lock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Draft Status
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    This CV is currently in draft mode and cannot be accessed by
                    others.
                  </p>
                  <p className="text-sm text-orange-700 mt-2">
                    To share this CV, please:
                  </p>
                  <ol className="text-sm text-orange-700 mt-1 ml-4 list-decimal space-y-1">
                    <li>Open the CV in the editor</li>
                    <li>Use the visibility settings in the editor header</li>
                    <li>
                      Change from &ldquo;Draft&rdquo; to &ldquo;Public&rdquo; or
                      &ldquo;Private&rdquo;
                    </li>
                    <li>Then come back here to share</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  router.push(`/editor/${cv.id}`);
                  onOpenChange(false);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Open in Editor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <ExternalLink className="h-5 w-5" />
            Share CV: {getCvDisplayName(cv)}
          </DialogTitle>
          <DialogDescription>
            Share your professional CV with recruiters, colleagues, or potential
            employers.
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
                onClick={onCopyLink}
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

          {/* Password Section for Private CVs */}
          {isPrivate && currentCv.password && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 p-1 rounded-full mt-0.5">
                  <Lock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Private CV - Password Required
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This CV is password protected. Share the password below with
                    authorized viewers.
                  </p>
                  <div className="mt-3">
                    <label className="text-xs font-medium text-yellow-800 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="mt-1">
                      <Input
                        value={currentCv.password}
                        readOnly
                        className="bg-yellow-50 border-yellow-200 text-yellow-900 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Methods Section */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Share via:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={onShareEmail}
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
          <div
            className={`border rounded-lg p-4 ${
              isPrivate
                ? "bg-yellow-50 border-yellow-200"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-1 rounded-full mt-0.5 ${
                  isPrivate ? "bg-yellow-100" : "bg-primary/20"
                }`}
              >
                {isPrivate ? (
                  <Lock className="h-4 w-4 text-yellow-600" />
                ) : (
                  <Globe className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isPrivate ? "text-yellow-800" : "text-primary"
                  }`}
                >
                  {isPrivate ? "Private Sharing" : "Public Sharing"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isPrivate ? "text-yellow-700" : "text-primary/80"
                  }`}
                >
                  {isPrivate
                    ? "This CV requires a password. Only people with the password can view it."
                    : "This CV is currently public. Anyone with this link can view your CV."}
                </p>
                {!isPrivate && (
                  <p className="text-sm mt-1 text-primary/80">
                    Consider switching to Private if you need password
                    protection for your CV.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
