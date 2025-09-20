import { ShowCVByTemplate } from "@/components/custom/cv-view/ShowCVByTemplate";
import { CvData } from "@/schemas/cv_data_schema";
import { useCvStore } from "@/stores/cv_store";
import { useEffect } from "react";
import { useState } from "react";

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
      setCvData(state.localitems?.find((x) => x?.id === id) as CvData);
    });
    (async () => {
      const data = await getSingle(id);
      if (!alive) {
        //setLoadingStatus(LoadingStatus.Error);
        return;
      }
      setCvData(data as CvData);
      setLoadingStatus(LoadingStatus.Loaded);
    })();
    return () => {
      alive = false;
    };
  }, [loadingStatus]);
  return (
    <>
      {loadingStatus === LoadingStatus.Loading && (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      )}
      {loadingStatus === LoadingStatus.Loaded && (
        <ShowCVByTemplate cvData={cvData as CvData} />
      )}
      {loadingStatus === LoadingStatus.Error && (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
      )}
    </>
  );
};