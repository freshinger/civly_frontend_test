"use client";

import React from "react";
import { Button } from "./ui/button";
import { MenuIcon, PanelRightIcon } from "lucide-react";
import { useSheetStore } from "@/stores/sheet_store";

type AppBarProps = {
  children?: React.ReactNode;
  showEditorButton?: boolean; // 👈 steuert Anzeige rechts
};

export const AppBar: React.FC<AppBarProps> = ({
  children,
  showEditorButton,
}) => {
  const showNav = useSheetStore((s) => s.showNav);
  const showEditor = useSheetStore((s) => s.showEditor);

  return (
    <header className="flex h-(--header-height) items-center space-between gap-2 border-b px-4 lg:px-6 h-[55px] bg-card">
      <Button size="icon" variant="ghost" type="button" onClick={showNav}>
        <MenuIcon className="!h-8 !w-8" strokeWidth={1.2} />
      </Button>
      <div className="flex-1 w-full flex items-center justify-center">
        {children}
      </div>

      <div className="h-[36px] w-[36px]">
        {showEditorButton && (
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={showEditor}
          >
            <PanelRightIcon className="!h-6 !w-6" strokeWidth={1.4} />
          </Button>
        )}
      </div>
    </header>
  );
};
