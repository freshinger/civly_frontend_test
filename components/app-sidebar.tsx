"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconFileDescription } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CivlyLogo } from "@/components/custom/civly-logo";
import type { CvData } from "@/schemas/cv_data_schema";
import { useCvStore } from "@/stores/cv_store";

export function AppSidebar({
  cvs: serverCvs = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & { cvs?: CvData[] }) {
  const pathname = usePathname();

  // Select from store
  const storeCvs = useCvStore((s) => (s.remoteItems ?? []) as CvData[]);
  const fetchAll = useCvStore((s) => s.fetchAll);

  React.useEffect(() => {
    if (storeCvs.length === 0) void fetchAll();
  }, [storeCvs.length, fetchAll]);

  // Merge server + store
  const cvs = React.useMemo(() => {
    const byId = new Map<string, CvData>();
    for (const cv of serverCvs) if (cv?.id) byId.set(cv.id, cv);
    for (const cv of storeCvs) if (cv?.id) byId.set(cv.id, cv); // store wins
    const arr = Array.from(byId.values());
    arr.sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() -
        new Date(b.createdAt ?? 0).getTime()
    );
    return arr;
  }, [serverCvs, storeCvs]);

  // Debug: what’s being rendered
  //console.log("AppSidebar rendering", {
  //  serverCvs: serverCvs.length,
  //  storeCvs: storeCvs.length,
  //  merged: cvs.length,
  //  ids: cvs.map((c) => c.id),
  //});

  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
      isActive: pathname === "/",
    },
  ];

  const resumesMeta = {
    title: "My Resumes",
    url: "/cv",
    icon: IconFileDescription,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props} className="w-[260px]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 justify-center h-auto hover:!bg-transparent"
            >
              <Link href="/">
                <CivlyLogo height={52} width={106} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} resumes={resumesMeta} />
        {/*
          These are global links that are always visible.
          For now, we only have one, but we might want to add more in the future.
        */}
        {/* <NavSecondary items={navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
