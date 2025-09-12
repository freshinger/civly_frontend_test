'use server';

import { createClient } from "@/utils/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ViewPasswordProtected from "./ViewPasswordProtected";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = createClient();

  const data  = await supabase.functions.invoke('restful-api/view/'+id, {
    method: 'GET'
  });

  if (data.error instanceof FunctionsHttpError) {
    const errorMessage = await data.error.context.json()
    console.log('Function returned an error', errorMessage);
    if(data.response?.status == 404){
      return notFound();
    }
    if(data.response?.status == 403){
      return (
      <>
        <ViewPasswordProtected id={id}/>
      </>
      )
    }
  }

  return (
    <>
        <pre>
            {JSON.stringify(data)}
        </pre>
    </>
  )
}
