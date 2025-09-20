"use server";

import { createClient } from "@/utils/supabase/server";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const data = await supabase.functions.invoke("cv-data/" + id, {
    method: "GET",
  });

  if (data.error instanceof FunctionsHttpError) {
    const errorMessage = await data.error.context.json();
  }

  if (data.data !== null) {
    return <ShowCVByTemplate cvData={data.data} />;
  }
}
