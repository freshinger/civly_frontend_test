'use client'

import React from 'react'
import { CVData } from '@/types/cv-data'
import { formatDate } from '@/utils/date-formatting'
import {
  IconPhone,
  IconMail,
  IconGlobe,
  IconBrandLinkedin,
  IconBrandXing,
} from '@tabler/icons-react'

interface CVATSTemplateProps {
  cvData: CVData
}

const getLinkedInUsername = (url: string) => {
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/)
  return match ? match[1] : 'LinkedIn'
}

const getXingUsername = (url: string) => {
  const match = url.match(/xing\.com\/profile\/([^\/\?]+)/)
  return match ? match[1] : 'Xing'
}

export default function CVATSTemplate({ cvData }: CVATSTemplateProps) {
  return (
    <div
      className="w-[794px] h-auto bg-white shadow-lg mx-auto relative print:shadow-none"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="px-12 pt-8 pb-4">
        <h1 className="text-4xl font-bold text-blue-600 mb-2 tracking-wide">
          {cvData.personalInformation.name.toUpperCase()}{' '}
          {cvData.personalInformation.surname.toUpperCase()}
        </h1>
        {cvData.personalInformation.professionalTitle && (
          <h2 className="text-lg font-normal text-gray-800 mb-3 tracking-wide">
            {cvData.personalInformation.professionalTitle.toUpperCase()}
          </h2>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-700 mb-4 justify-center">
          {cvData.personalInformation.phone && (
            <div className="flex items-center gap-1">
              <IconPhone className="w-3 h-3" />
              <span>{cvData.personalInformation.phone}</span>
            </div>
          )}
          {cvData.personalInformation.email && (
            <div className="flex items-center gap-1">
              <IconMail className="w-3 h-3" />
              <span>{cvData.personalInformation.email}</span>
            </div>
          )}
          {cvData.personalInformation.website && (
            <div className="flex items-center gap-1">
              <IconGlobe className="w-3 h-3" />
              <span>
                {cvData.personalInformation.website.replace('https://', '')}
              </span>
            </div>
          )}
          {cvData.personalInformation.linkedin && (
            <div className="flex items-center gap-1">
              <IconBrandLinkedin className="w-3 h-3" />
              <span>
                {getLinkedInUsername(cvData.personalInformation.linkedin)}
              </span>
            </div>
          )}
          {cvData.personalInformation.xing && (
            <div className="flex items-center gap-1">
              <IconBrandXing className="w-3 h-3" />
              <span>{getXingUsername(cvData.personalInformation.xing)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {cvData.personalInformation.summary && (
        <div className="px-12 mb-6">
          <p className="text-sm text-gray-800 leading-relaxed">
            {cvData.personalInformation.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {cvData.experience.length > 0 && (
        <div className="px-12 mb-6">
          <h3 className="text-base font-bold text-blue-600 tracking-wide border-b border-blue-200 pb-1 mb-4">
            EXPERIENCE
          </h3>
          <div className="space-y-4">
            {cvData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {exp.role}
                    </h4>
                    <div className="text-sm text-gray-700">{exp.company}</div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium ml-4">
                    {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cvData.education.length > 0 && (
        <div className="px-12 mb-6">
          <h3 className="text-base font-bold text-blue-600 tracking-wide border-b border-blue-200 pb-1 mb-4">
            EDUCATION
          </h3>
          <div className="space-y-3">
            {cvData.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {edu.degree}
                    </h4>
                    <div className="text-sm text-gray-700">
                      {edu.institution}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium ml-4">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    {edu.location && ` • ${edu.location}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {cvData.skillGroups.length > 0 && (
        <div className="px-12 mb-8">
          <h3 className="text-base font-bold text-blue-600 tracking-wide border-b border-blue-200 pb-1 mb-4">
            SKILLS
          </h3>
          <div className="space-y-3">
            {cvData.skillGroups
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((skillGroup, index) => (
                <div key={index}>
                  <h4 className="text-sm font-bold text-blue-600 mb-1 tracking-wide">
                    {skillGroup.name.toUpperCase()}
                  </h4>
                  <div className="text-sm text-gray-700">
                    {skillGroup.skills
                      .sort((a, b) => a.order - b.order)
                      .map((skill, skillIndex) => (
                        <span key={skillIndex}>
                          {skill.name}
                          {skillIndex < skillGroup.skills.length - 1
                            ? ', '
                            : ''}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}