"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { EditorSidebarRight } from "@/app/(main)/editor/editor-sidebar/editor-sidebar-right";
import { useEffect, useState } from "react";
import { useCvStore } from "@/stores/cv_store";
import { CvData } from "@/schemas/cv_data_schema";
import { useParams } from "next/navigation";
import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";
import { TemplatePreview } from "./TemplatePreview";

export default function Page() {
  const { id } = useParams() as { id: string };
  console.log("ID", id);
  return (
    <SidebarProvider isWide={true} className="overflow-hidden h-[100vh]">
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 overflow-scroll">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Project Management & Task Tracking
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="min-h-[100vh] gap-4 p-4 overflow-y-auto">
          <TemplatePreview id={id} />
        </div>
      </SidebarInset>
      <EditorSidebarRight id={id} />
    </SidebarProvider>
  );
}

// Fabricio kann hier arbeiten
const Header = () => {
  return (
    <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 overflow-scroll">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                Project Management & Task Tracking
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};
