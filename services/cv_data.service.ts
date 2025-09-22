import { CvData } from "@/schemas/cv_data_schema";
import { createClient } from "@/utils/supabase/client";
import { FunctionRegion } from "@supabase/supabase-js";

const sb = createClient();

const path = "cv-data/";
const region = FunctionRegion.EuWest2;

export async function fetchAll(): Promise<CvData[]> {
  const { data, error } = await sb.functions.invoke(path, {
    method: "GET",
    region,
  });
  if (error) throw error;
  return data.data;
}

// Single-item CRUD (server owns timestamps)
export async function fetchCv(id: string): Promise<CvData> {
  const { data, error } = await sb.functions.invoke(path + id, {
    method: "GET",
    region,
  });
  if (error) throw error;
  return data;
}

export async function createEmptyCv(): Promise<{ id: string }> {
  const { data, error } = await sb.functions.invoke(path, {
    method: "POST",
    body: {},
    region,
  });
  if (error) throw error;
  return data as { id: string };
}

export async function duplicateCv(id: string | null): Promise<string> {
  if (id === null) return "";
  const { data, error } = await sb.functions.invoke(path + id, {
    method: "POST",
    body: {},
    region,
  });
  if (error) throw error;
  return data.id as string;
}

export async function updateCVName(id: string, value: string) {
  const { data, error } = await sb.functions.invoke(path + id, {
    method: "PATCH",
    body: { name: value },
    region,
  });
}

export async function updateVisibility(
  cv: CvData,
  value: "public" | "draft" | "private",
  newPassword: string | undefined
) {
  let payload = { visibility: value, name: cv.name } as CvData
  if(newPassword){
    payload = { visibility: value, name: cv.name, password: newPassword } as CvData
  }
  const { data, error } = await sb.functions.invoke(path + cv.id, {
    method: "PATCH",
    body: payload,
    region,
  });

  if (error) throw error;
  return data;
}

export async function updateCv(item: CvData): Promise<void> {
  const { error } = await sb.functions.invoke(path + item.id, {
    method: "PUT",
    body: item,
    region,
  });
  if (error) throw error;
}

export async function deleteCv(id: string): Promise<void> {
  const { error } = await sb.functions.invoke(path + id, {
    method: "DELETE",
    region,
  });
  if (error) throw error;
}

export function handleExportPdf(cv: CvData) {
  fetch("/export/" + cv.id)
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
      link.download = `cv-${cv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
}
