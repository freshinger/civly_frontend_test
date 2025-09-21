import { CVCleanTemplate } from '@/components/custom/cv-templates/cv-clean-template'
import CVATSTemplate from '@/components/custom/cv-templates/cv-ats-template'

import { mockCvData } from '@/data/mock-cv-data'

export default function CVPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* CV Clean Template */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">
            CV Clean Template
          </h2>
          <CVCleanTemplate cvData={mockCvData} accentColor="text-blue-600" />
        </div>

        {/* CV ATS Template */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">
            CV ATS Template
          </h2>
          <CVATSTemplate cvData={mockCvData} />
        </div>
      </div>
    </div>
  )
}
