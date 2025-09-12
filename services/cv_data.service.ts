import { CvData } from "@/schemas/cv_data_schema";
import { createClient } from "@/utils/supabase/client";

// Fetch ALL (collection)
export async function fetchAllCvs(): Promise<CvData[]> {
  const sb = createClient();
  const { data, error } = await sb.functions.invoke("restful-api/cv", {
    method: "GET",
  });
  if (error) throw error;
  return (data as { items: CvData[] }).items;
}

// Single-item CRUD (server owns timestamps)
export async function createEmptyCv(): Promise<{ id: string }> {
  const sb = createClient();
  const { data, error } = await sb.functions.invoke("cv-create-empty", {
    body: {},
  });
  if (error) throw error;
  return data as { id: string };
}

export async function updateCv(item: CvData): Promise<void> {
  const sb = createClient();
  const { error } = await sb.functions.invoke("cv-update", { body: { item } });
  if (error) throw error;
}

export async function deleteCv(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.functions.invoke("cv-delete", { body: { id } });
  if (error) throw error;
}
