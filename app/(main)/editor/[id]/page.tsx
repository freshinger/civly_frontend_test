"use client";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { EditorSidebarRight } from "@/app/(main)/editor/editor-sidebar/editor-sidebar-right";
import { useParams } from "next/navigation";
import { TemplatePreview } from "./TemplatePreview";
import { SiteHeader } from "@/components/site-header";
import { EditorHeader } from "../editor-sidebar/editor-header";

export default function Page() {
  const { id } = useParams() as { id: string };
  return (
    <SidebarProvider isWide={true} className="overflow-hidden h-[100vh]">
      <SidebarInset>
        <SiteHeader />
        <EditorHeader cvId={id} />
        <div className="min-h-[100vh] gap-4 p-4 overflow-y-auto">
          <TemplatePreview id={id} />
        </div>
      </SidebarInset>
      <EditorSidebarRight id={id} />
    </SidebarProvider>
  )
}