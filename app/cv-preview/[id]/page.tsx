"use server";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";

export default async function Page({
  params, searchParams
}: {
  params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const token = (await searchParams).token

  let supabase;
  if(token){
    supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
  }else {
    supabase = await createClient();
  }
  

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
