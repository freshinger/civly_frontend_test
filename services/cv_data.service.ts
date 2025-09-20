import { CvData } from "@/schemas/cv_data_schema";
import { createClient } from "@/utils/supabase/client";

const sb = createClient();

const path = "cv-data/";

// Fetch ALL (collection)
export async function fetchAllCvs(): Promise<CvData[]> {
  const { data, error } = await sb.functions.invoke("cv-data/", {
    method: "GET",
  });
  if (error) throw error;
  return data.data;
}

// Single-item CRUD (server owns timestamps)
export async function fetchCv(id: string): Promise<CvData> {
  const { data, error } = await sb.functions.invoke("cv-data/", {
    method: "GET",
  });
  if (error) throw error;
  return data;
}

export async function createEmptyCv(): Promise<{ id: string }> {
  const { data, error } = await sb.functions.invoke("cv-data/", {
    method: "POST",
    body: {},
  });
  if (error) throw error;
  return data as { id: string };
}

export async function duplicateCv(id: string | null): Promise<CvData | null> {
  if (id === null) return null;
  const { data, error } = await sb.functions.invoke("cv-data/" + id, {
    method: "POST",
    body: {},
  });
  if (error) throw error;
  return data;
}

export async function updateCVName(id: string, value: string) {
  const { data, error } = await sb.functions.invoke("cv-data/" + id, {
    method: "PATCH",
    body: { name: value },
  });
}

export async function updateVisibility(id: string, value: string) {
  const { data, error } = await sb.functions.invoke("cv-data/" + id, {
    method: "PATCH",
    body: { visibility: value },
  });
}

export async function updateCv(item: CvData): Promise<void> {
  const { error } = await sb.functions.invoke("cv-data/" + item.id, {
    method: "PUT",
    body: { item },
  });
  if (error) throw error;
}

export async function deleteCv(id: string): Promise<void> {
  const { error } = await sb.functions.invoke("cv-data/" + id, {
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
      link.download = `cv-${cv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
}
