"use client";

import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";
import type { CvData } from "@/schemas/cv_data_schema";
import { useCvStore } from "@/stores/cv_store";
import { useEffect, useMemo, useState } from "react";

enum LoadingStatus {
  Loading,
  Loaded,
  Error,
}

export const TemplatePreview = ({ id }: { id: string }) => {
  const getSingle = useCvStore((s) => s.getSingle);
  const [cvData, setCvData] = useState<CvData | null>(null);
  const subscribe = useCvStore.subscribe;
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Loading
  );

  useEffect(() => {
    let alive = true;
    subscribe((state) => {
      console.log("state change", state);
      setCvData(state.localItems?.find((x) => x?.id === id) as CvData);
    });
    (async () => {
      try {
        setLoadingStatus(LoadingStatus.Loading);
        const data = (await getSingle(id)) as CvData | undefined;
        if (!alive) return;
        if (data) {
          setCvData(data);
          setLoadingStatus(LoadingStatus.Loaded);
        } else {
          setCvData(null);
          setLoadingStatus(LoadingStatus.Error);
        }
      } catch {
        if (!alive) return;
        setCvData(null);
        setLoadingStatus(LoadingStatus.Error);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, getSingle]);

  // Optional memo to avoid unnecessary rerenders of heavy preview
  const content = useMemo(() => {
    if (loadingStatus === LoadingStatus.Loading)
      return (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      );

    if (loadingStatus === LoadingStatus.Error || !cvData)
      return (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
      );

    return <ShowCVByTemplate cvData={cvData} />;
  }, [loadingStatus, cvData]);

  return <>{content}</>;
};
