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
import { IconX } from "@tabler/icons-react";
import { useMediaQuery } from "usehooks-ts";
import { useSheetStore } from "@/stores/sheet_store";
import { useToast } from "@/hooks/use-toast";
type Props = { id: string } & React.ComponentProps<typeof Sidebar>;

export function EditorSidebarRight({ id, ...props }: Props) {
  const supabase = React.useMemo(() => createClient(), []);
  const [userId, setUserId] = React.useState<string>("");
  const [loadingStatus, setLoadingStatus] = React.useState<LoadingStatus>(
    LoadingStatus.Loading
  );
  const { toast } = useToast();
  const getSingle = useCvStore((s) => s.getSingle);
  const saveRemote = useCvStore((s) => s.saveRemote);
  const saveLocally = useCvStore((s) => s.saveLocally);
  const hideEditor = useSheetStore((s) => s.hideEditor);

  const [tab, setTab] = React.useState("layout");

  const isTablet = useMediaQuery("(max-width: 1260px)");

  const form = useForm<CvData>({
    defaultValues: defaultCvData,
    shouldUnregister: false,
    mode: "all",
    resolver: zodResolver(cvDataSchema),
  });

  // Load user
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
      toast.error("Invalid data");
      return;
    }
    try {
      await saveRemote(parsed.data);
      toast.success("Saved");
    } catch (e) {
      //console.error("Error saving CV:", e);
      toast.error("saving data failed");
    }
  }

  return (
    <Sidebar
      collapsible="none"
      className="top-0 h-svh md:h-screen w-full max-w-[400px] border-l"
      {...props}
    >
      <Form {...form}>
        <form
          className="h-full w-full"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          {/* Stable layout: header (shrink-0) / content (flex-1, scroll) / footer (shrink-0) */}
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex h-full min-h-0 flex-col"
          >
            {/* HEADER */}
            <SidebarHeader className="shrink-0 border-b border-sidebar-border bg-white">
              {isTablet && (
                <div className="flex h-7 items-center justify-between ">
                  <h2 className="text-base font-semibold">CV Editor</h2>
                  <Button type="button" variant="ghost" onClick={hideEditor}>
                    <IconX size={24} />
                  </Button>
                </div>
              )}
              <TabsList className="flex h-10 w-full justify-start gap-0.5 overflow-x-auto bg-white pb-2">
                <TabsTrigger
                  value="layout"
                  className="flex-shrink-0 px-2 text-xs"
                >
                  Layout
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex-shrink-0 px-2 text-xs"
                >
                  Information
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex-shrink-0 px-2 text-xs"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="work"
                  className="flex-shrink-0 px-2 text-xs"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="flex-shrink-0 px-2 text-xs"
                >
                  Education
                </TabsTrigger>
              </TabsList>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent className="flex-1 min-h-0 overflow-y-auto overscroll-contain gap-4">
              <TabsContent value="layout">
                <LayoutTabPanel />
              </TabsContent>

              <TabsContent value="profile">
                <PersonalInformationTab userId={userId} cvId={id} />
              </TabsContent>

              <TabsContent value="skills">
                <SkillsTab />
              </TabsContent>

              <TabsContent value="work">
                <ExperienceTab />
              </TabsContent>

              <TabsContent value="education">
                <EducationTab />
              </TabsContent>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="h-[70px] shrink-0 border-t border-sidebar-border">
              <Button type="submit" className="h-full w-full">
                {form.formState.isSubmitting ? "Publishing..." : "Publish"}
              </Button>
            </SidebarFooter>
          </Tabs>
        </form>
      </Form>
    </Sidebar>
  );
}
