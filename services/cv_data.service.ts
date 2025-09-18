import { CvData } from "@/schemas/cv_data_schema";
import { createClient } from "@/utils/supabase/client";
import { FunctionRegion } from "@supabase/supabase-js";

const sb = createClient();

const path = "cv-data/";

export async function fetchAllCvs(): Promise<CvData[]> {
  const { data, error } = await sb.functions.invoke(path, {
    method: "GET",
    region: FunctionRegion.EuWest1,
  });
  if (error) throw error;
  return (data as { items: CvData[] }).items;
}

// Single-item CRUD (server owns timestamps)
export async function fetchCv(id: string): Promise<CvData> {
  console.log("starting fetch", id);
  const { data, error } = await sb.functions.invoke(path + id, {
    method: "GET",
  });
  console.log("ending fetch", data);
  if (error) throw error;
  return data;
}

export async function createEmptyCv(): Promise<{ id: string }> {
  const { data, error } = await sb.functions.invoke(path, {
    method: "POST",
    body: {},
  });
  if (error) throw error;
  return data as { id: string };
}

export async function duplicateCv(id: string): Promise<{ id: string }> {
  const { data, error } = await sb.functions.invoke(path + id, {
    method: "POST",
    body: {},
  });
  if (error) throw error;
  return data as { id: string };
}

export async function updateCv(item: CvData): Promise<void> {
  const { error } = await sb.functions.invoke(path + item.id, {
    method: "PUT",
    body: item,
  });
  if (error) throw error;
}

export async function deleteCv(id: string): Promise<void> {
  const { error } = await sb.functions.invoke(path + id, {
    method: "DELETE",
  });
  if (error) throw error;
}

export function handleExportPdf(id: string) {
  fetch("export/" + id)
    .then(async (res) => {
      if (res.body !== null) {
        const reader = res.body.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump(): Promise<void> {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      }
    })
    .then((stream) => new Response(stream))
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(
        new Blob([blob as unknown as BlobPart], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `cv-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
}
