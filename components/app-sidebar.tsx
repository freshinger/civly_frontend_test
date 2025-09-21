"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
import { CvData } from "@/schemas/cv_data_schema";
import { useCvStore } from "@/stores/cv_store";

export function AppSidebar({
  cvs: serverCvs = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & { cvs?: CvData[] }) {
  const { remoteItems: storeCvs, fetchAll } = useCvStore();

  // Sync store with server data on mount if store is empty or server has more data
  React.useEffect(() => {
    if (
      serverCvs.length > 0 &&
      (storeCvs.length === 0 || serverCvs.length > storeCvs.length)
    ) {
      fetchAll();
    }
  }, [serverCvs.length, storeCvs.length, fetchAll]);

  // Use server CVs if available (they are authoritative), otherwise use store CVs
  const cvs = serverCvs.length > 0 ? serverCvs : storeCvs;
  console.log("AppSidebar rendering", {
    storeCvs: storeCvs.length,
    serverCvs: serverCvs.length,
    using: cvs.length,
  });
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: IconDashboard,
        isActive: true,
      },
    ],
    resumes: {
      title: "My Resumes",
      url: "/cv",
      icon: IconFileDescription,
      items: [],
    },
    navSecondary: [
      {
        title: "Help",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
        <NavMain items={data.navMain} resumes={data.resumes} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
