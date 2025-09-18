"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PersonalInformationTab } from "./personal-information"; // RHF version
import { ExperienceTab } from "./experience-tab"; // RHF + useFieldArray
import { LayoutTabPanel } from "./layout-tab";

import type { CvData } from "@/schemas/cv_data_schema";
import { useEffect } from "react";
import { EducationTab } from "./education-tab";
import { SkillsTab } from "./skill-tab";

import { useCvStore } from "@/stores/cv_store";

import { cvDataSchema } from "@/schemas/cv_data_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

export function EditorSidebarRight({
  id,
  ...props
}: { id: string } & React.ComponentProps<typeof Sidebar>) {
  console.log("ID in sidebar: ", id);
  const [value, setValue] = React.useState("layout");

  const getSingle = useCvStore((s) => s.getSingle);
  const saveLocally = useCvStore((s) => s.saveLocally);

  const form = useForm<CvData>({
    defaultValues: {},
    shouldUnregister: false,
    mode: "onSubmit",
    resolver: zodResolver(cvDataSchema),
  });

  useEffect(() => {
    (async () => {
      if (id) {
        const cv = await getSingle(id);
        form.reset(cv);
      }
    })();
    const subscription = form.watch((values, { name, type }) => {
      saveLocally(values as CvData);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = (data: CvData) => {
    useCvStore.getState().saveRemote(data);
  };

  const CustomTabsContent: React.FC<{
    value: string;
    className?: string;
    children: React.ReactNode;
  }> = ({ value, className, children }) => (
    <TabsContent
      value={value}
      className={`flex-1 flex-col gap-4 ${className ?? ""}`}
    >
      {children}
    </TabsContent>
  );

  return (
    <Sidebar
      collapsible="none"
      className="top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <Form {...form}>
        <form
          className="w-full h-full flex flex-col"
          onSubmit={(e) => e.preventDefault()}
        >
          <Tabs
            value={value}
            onValueChange={setValue}
            className="w-full gap-0 h-screen flex flex-col"
          >
            <SidebarHeader className="border-sidebar-border border-b h-[50px] w-full ">
              <TabsList className="w-full h-full bg-white ">
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="profile">Information</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="work">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>
            </SidebarHeader>

            <SidebarContent className="flex-none gap-4 overflow-y-auto h-[calc(100vh-140px)]">
              <CustomTabsContent value="layout">
                <LayoutTabPanel />
              </CustomTabsContent>

              {/* RHF tabs: no props, they read from form context */}
              <CustomTabsContent value="profile">
                <PersonalInformationTab />
              </CustomTabsContent>

              <CustomTabsContent value="skills">
                <SkillsTab />
              </CustomTabsContent>

              <CustomTabsContent value="work">
                <ExperienceTab />
              </CustomTabsContent>

              <CustomTabsContent value="education">
                <EducationTab />
              </CustomTabsContent>
            </SidebarContent>

            <SidebarFooter className="border-sidebar-border border-t h-[70px] shrink-0">
              <Button
                type="submit"
                className="w-full h-full"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  form.handleSubmit((data) => {
                    onSubmit(data);
                  })();
                }}
              >
                {form.formState.isSubmitting ? "Publishing..." : "Publish"}
              </Button>
            </SidebarFooter>
          </Tabs>
        </form>
      </Form>
    </Sidebar>
  );
}
