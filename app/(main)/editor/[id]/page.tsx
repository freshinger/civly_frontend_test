// app/(main)/editor/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { useMediaQuery } from "usehooks-ts";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { AppBar } from "@/components/appBar";
import { EditorHeaderResponsive } from "../editor-sidebar/editor-header-responsive";
import { EditorSidebarRight } from "@/app/(main)/editor/editor-sidebar/editor-sidebar-right";
import { TemplatePreview } from "./TemplatePreview";
import { useSheetStore } from "@/stores/sheet_store";

// ---- Backdrop (portaled so it sits above everything) ----
function Backdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return createPortal(
    <button
      aria-label="Close editor"
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/40 opacity-100 transition-opacity"
    />,
    document.body
  );
}

export default function Page() {
  const { id } = useParams() as { id: string };
  const [mounted, setMounted] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const isDesktop = useMediaQuery("(min-width: 1260px)");
  const editorOpen = useSheetStore((s) => s.editorOpen);
  const hideEditor = useSheetStore((s) => s.hideEditor);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gridTemplateColumns = mounted
    ? isDesktop
      ? rightSidebarOpen
        ? "1fr 400px"
        : "1fr 0px"
      : "1fr"
    : "1fr";
  const rightSidebar = mounted
    ? isDesktop
      ? `relative h-full w-[400px] overflow-hidden ${
          rightSidebarOpen ? "" : "hidden lg:hidden"
        } lg:block`
      : // Mobile overlay: sits ABOVE the Backdrop using higher z
        `fixed right-0 top-0 z-[500] h-screen w-[400px] max-w-[100%] transform bg-background shadow-lg transition-transform duration-300 ${
          editorOpen ? "translate-x-0" : "translate-x-full"
        }`
    : "";
  return (
    <div className="h-screen w-full max-w-full overflow-hidden bg-red-500 flex justify-between items-stretch">
      {/* LEFT COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10">
          <AppBar showEditorButton>
            <EditorHeaderResponsive cvId={id} />
          </AppBar>
        </div>

        <div className="min-h-0 w-full flex-1 bg-blue-100">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            limitToBounds={false}
            centerOnInit
            wheel={{ step: 0.15 }}
            pinch={{ step: 0.15 }}
          >
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <div className="grid h-full w-full place-items-center">
                <div className="inline-block">
                  <TemplatePreview id={id} />
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={rightSidebar}>
        <div className="h-full w-full border-l">
          <EditorSidebarRight id={id} />
        </div>
      </div>

      {!isDesktop && <Backdrop open={editorOpen} onClose={hideEditor} />}
    </div>
  );
}
