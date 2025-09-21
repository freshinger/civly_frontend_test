// app/(main)/MainLayout.tsx
"use client";

import { useMediaQuery } from "usehooks-ts";
import { createPortal } from "react-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSheetStore } from "@/stores/sheet_store";

function Backdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return createPortal(
    <button
      aria-label="Close navigation"
      onClick={onClose}
      className="fixed inset-0 z-[9998] bg-black/40 opacity-100 transition-opacity"
    />,
    document.body
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTablet = useMediaQuery("(max-width: 1000px)");

  // Zustand store (single source of truth)
  const navOpen = useSheetStore((s) => s.navOpen);
  const showNav = useSheetStore((s) => s.showNav);
  const hideNav = useSheetStore((s) => s.hideNav);

  return (
    <SidebarProvider className={isTablet ? "flex-col" : "flex-row"}>
      {/* ---- ALWAYS-MOUNTED SIDEBAR ---- */}
      <div
        className={
          isTablet
            ? [
                "fixed left-0 top-0 z-[9999] h-screen w-[260px] sm:w-[260px]",
                "bg-background shadow-lg border-r",
                "transform transition-transform duration-300",
                navOpen ? "translate-x-0" : "-translate-x-full",
              ].join(" ")
            : // Desktop: static column
              "relative z-10 h-screen w-[260px] sm:w-[260px] shrink-0 border-r bg-background"
        }
        // open from outside (e.g., burger button) -> call showNav/hideNav
        onKeyDown={(e) => {
          if (isTablet && e.key === "Escape") hideNav();
        }}
      >
        <AppSidebar />
      </div>

      {/* Tablet-only backdrop (ported above everything, incl. header triggers) */}
      {isTablet && <Backdrop open={navOpen} onClose={hideNav} />}

      {/* ---- CONTENT ---- */}
      <SidebarInset>
        <main className="min-w-0 flex flex-1 flex-col gap-4 p-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
