import { CVCleanTemplate } from '@/components/custom/cv-templates/cv-clean-template'
import { mockCvData } from '@/data/mock-cv-data'

export default function CVPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto">
         <CVCleanTemplate cvData={mockCvData} accentColor="text-blue-600" />
      </div>
    </div>
  )
}
