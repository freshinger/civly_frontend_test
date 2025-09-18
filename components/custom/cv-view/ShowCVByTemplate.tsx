import { CVCleanTemplate } from "../cv-templates/cv-clean-template";
import CVATSTemplate from "../cv-templates/cv-ats-template";
import { CvData } from "@/schemas/cv_data_schema";

export function ShowCVByTemplate({ cvData }: { cvData: CvData }) {
  console.log("cvData: ", cvData);
  if (!cvData || !cvData.layoutConfigs) {
    return (
      <div className="flex items-center justify-center w-[200px]">
        <span className="text-md w-[200px]">
          cvData: {JSON.stringify(cvData)}{" "}
        </span>
      </div>
    );
  }
  switch ((cvData as CvData).layoutConfigs?.templateId) {
    case 0:
      return (
        <>
          <CVCleanTemplate cvData={cvData} accentColor="text-blue-600" />
        </>
      );
    case 1:
      return (
        <>
          <CVATSTemplate cvData={cvData} />
        </>
      );
    default:
      return (
        <>
          <CVCleanTemplate cvData={cvData} accentColor="text-blue-600" />
        </>
      );
  }
}
