import { CVData } from "@/types/cv-data"
import { CVCleanTemplate } from "../cv-templates/cv-clean-template"
import CVATSTemplate from "../cv-templates/cv-ats-template"

export function ShowCVByTemplate({cvData}: {cvData: CVData}){
    switch ((cvData as CVData).layout_configs?.template_id) {
    case 0:
        return (
        <>
            <CVCleanTemplate cvData={cvData} accentColor="text-blue-600" />
        </>
        )
    case 1:
        return (
        <>
            <CVATSTemplate cvData={cvData} />
        </>
        )
    default:
        return (
        <>
            <CVCleanTemplate cvData={cvData} accentColor="text-blue-600" />
        </>
        )
    }
}


