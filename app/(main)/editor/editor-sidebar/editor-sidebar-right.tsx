"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PersonalInformationTab } from "./personal-information";
import { ExperienceTab } from "./experience-tab";
import { LayoutTabPanel } from "./layout-tab";
import { EducationTab } from "./education-tab";
import { SkillsTab } from "./skill-tab";

import type { CvData } from "@/schemas/cv_data_schema";
import { cvDataSchema, defaultCvData } from "@/schemas/cv_data_schema";

import { useCvStore } from "@/stores/cv_store";
import { LoadingStatus } from "@/types/loadingState";

import { createClient } from "@/utils/supabase/client";

type Props = { id: string } & React.ComponentProps<typeof Sidebar>;

export function EditorSidebarRight({ id, ...props }: Props) {
  const supabase = React.useMemo(() => createClient(), []);
  const [userId, setUserId] = React.useState<string>("");

  const [loadingStatus, setLoadingStatus] = React.useState<LoadingStatus>(
    LoadingStatus.Loading
  );

  const getSingle = useCvStore((s) => s.getSingle);
  const saveRemote = useCvStore((s) => s.saveRemote);
  const saveLocally = useCvStore((s) => s.saveLocally);

  const [tab, setTab] = React.useState("layout");

  const form = useForm<CvData>({
    defaultValues: defaultCvData,
    shouldUnregister: false,
    mode: "all",
    resolver: zodResolver(cvDataSchema),
  });

  // Load user (client-safe, no top-level await)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;
      if (!error) setUserId(data.user?.id ?? "");
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  // Load CV + local autosave
  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!id) return;
      try {
        const cv = await getSingle(id);
        if (!alive) return;
        if (cv) {
          form.reset(cv);
          setLoadingStatus(LoadingStatus.Loaded);
        } else {
          setLoadingStatus(LoadingStatus.Error);
        }
      } catch {
        if (alive) setLoadingStatus(LoadingStatus.Error);
      }
    })();

    const subscription = form.watch((values) => {
      if (loadingStatus === LoadingStatus.Loaded) {
        saveLocally(values as CvData);
      }
    });

    return () => {
      subscription.unsubscribe();
      alive = false;
    };
  }, [id, form, getSingle, saveLocally, loadingStatus]);

  async function onSubmit() {
    const data = form.getValues();
    const parsed = cvDataSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Invalid data:", parsed.error);
      return;
    }
    try {
      await saveRemote(parsed.data);
    } catch (e) {
      console.error("Error saving CV:", e);
    }
  }

  const CustomTabsContent: React.FC<
    React.PropsWithChildren<{ value: string; className?: string }>
  > = ({ value, className, children }) => (
    <TabsContent value={value} className={`flex-1 flex-col ${className ?? ""}`}>
      {children}
    </TabsContent>
  );

  return (
    <Sidebar
      collapsible="none"
      className="top-0 h-svh border-l w-full"
      {...props}
    >
      <Form {...form}>
        <form
          className="w-full h-full flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="w-full h-full flex flex-col"
          >
            <SidebarHeader className="border-sidebar-border border-b h-[50px] w-full">
              <TabsList className="w-full h-full bg-white flex justify-start gap-1">
                <TabsTrigger value="layout" className="text-xs flex-shrink-0">
                  Layout
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-xs flex-shrink-0">
                  Information
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs flex-shrink-0">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="work" className="text-xs flex-shrink-0">
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="text-xs flex-shrink-0"
                >
                  Education
                </TabsTrigger>
              </TabsList>
            </SidebarHeader>

            {/* Make the middle stretch & scroll */}
            <SidebarContent className="flex-1 min-h-0 gap-4 overflow-y-auto">
              <CustomTabsContent value="layout">
                <LayoutTabPanel />
              </CustomTabsContent>

              <CustomTabsContent value="profile">
                <PersonalInformationTab userId={userId} cvId={id} />
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
              <Button type="submit" className="w-full h-full">
                {form.formState.isSubmitting ? "Publishing..." : "Publish"}
              </Button>
            </SidebarFooter>
          </Tabs>
        </form>
      </Form>
    </Sidebar>
  );
}
