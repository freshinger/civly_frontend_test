import { CVCleanTemplate } from '../cv-templates/cv-clean-template'
import CVATSTemplate from '../cv-templates/cv-ats-template'
import { CvData } from '@/schemas/cv_data_schema'
import { ColorRecord } from '@/types/colorType'

export function ShowCVByTemplate({ cvData }: { cvData: CvData }) {
  console.log('cvData: ', cvData)

  // Extract layout configurations with defaults
  const templateId = cvData.layoutConfigs?.templateId ?? 0
  const colorId = cvData.layoutConfigs?.colorId ?? 0
  const fontId = cvData.layoutConfigs?.fontId ?? 0
  const fontSizeId = cvData.layoutConfigs?.fontSizeId ?? 11

  // Get the accent color from ColorRecord
  const accentColor = ColorRecord[colorId]?.hex || ColorRecord[0].hex

  switch (templateId) {
    case 0:
      return (
        <>
          <CVCleanTemplate
            cvData={cvData}
            colorId={colorId}
            fontId={fontId}
            fontSizeId={fontSizeId as 10 | 11 | 12}
            accentColor={accentColor}
          />
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
          <CVCleanTemplate
            cvData={cvData}
            colorId={colorId}
            fontId={fontId}
            fontSizeId={fontSizeId as 10 | 11 | 12}
            accentColor={accentColor}
          />
        </>
      )
  }
}
