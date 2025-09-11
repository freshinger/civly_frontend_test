// This component MUST be a client component to perform DOM measurements.
'use client'

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import Image from 'next/image'
import { CVData } from '@/types/cv-data'
import { formatDate } from '@/utils/date-formatting'
import {
  isValidUrl,
  getLinkedInUsername,
  getXingUsername,
} from '@/utils/cv-helpers'
import {
  IconGlobe,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconBrandXing,
} from '@tabler/icons-react'

// --- Types ---
interface CVCleanTemplateProps {
  cvData: CVData
  accentColor?: string
}

// --- Layout Constants ---
const A4_PAGE_HEIGHT_PX = 1123
const PAGE_PADDING_PX = 40 // UPDATED: Reduced to 40px for more content
const PAGE_PADDING_Y_PX = PAGE_PADDING_PX * 2
const USABLE_PAGE_HEIGHT_SUBSEQUENT = A4_PAGE_HEIGHT_PX - PAGE_PADDING_Y_PX

// --- Visual Page Component ---
function Page({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-white shadow-lg mb-8 mx-auto overflow-hidden relative"
      style={{
        width: '794px',
        height: `${A4_PAGE_HEIGHT_PX}px`,
        padding: `${PAGE_PADDING_PX}px`, // UPDATED
        fontSize: '11px',
        lineHeight: '1.3',
      }}
    >
      {children}
    </div>
  )
}
// --- Main Template Component with Pagination Logic ---
export function CVCleanTemplate({
  cvData,
  accentColor = 'text-blue-600',
}: CVCleanTemplateProps) {
  const [paginatedPages, setPaginatedPages] = useState<ReactNode[]>([])
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isCalculating, setIsCalculating] = useState(true)

  useEffect(() => {
    setIsCalculating(true)

    const measureAndPaginate = () => {
      const leftContainer = leftColRef.current
      const rightContainer = rightColRef.current
      const headerContainer = headerRef.current
      if (!leftContainer || !rightContainer || !headerContainer) return

      const headerHeight = headerContainer.offsetHeight
      const usableHeightPage1 =
        A4_PAGE_HEIGHT_PX - headerHeight - PAGE_PADDING_Y_PX

      const getBlockHeight = (block: HTMLElement) => {
        const style = window.getComputedStyle(block)
        return (
          block.offsetHeight +
          parseInt(style.marginTop, 10) +
          parseInt(style.marginBottom, 10)
        )
      }

      const paginateColumn = (
        blocks: HTMLElement[],
        originalJsx: ReactNode[],
      ) => {
        const pages: ReactNode[][] = []
        let currentPage: ReactNode[] = []
        let currentPageHeight = 0
        let isFirstPage = true

        blocks.forEach((block, index) => {
          const blockHeight = getBlockHeight(block)
          const usableHeight = isFirstPage
            ? usableHeightPage1
            : USABLE_PAGE_HEIGHT_SUBSEQUENT

          if (
            currentPageHeight + blockHeight > usableHeight &&
            currentPage.length > 0
          ) {
            pages.push(currentPage)
            currentPage = [originalJsx[index]]
            currentPageHeight = blockHeight
            isFirstPage = false
          } else {
            currentPage.push(originalJsx[index])
            currentPageHeight += blockHeight
          }
        })
        if (currentPage.length > 0) pages.push(currentPage)
        return pages
      }

      const paginatedLeft = paginateColumn(
        Array.from(leftContainer.children) as HTMLElement[],
        CVColumnLeft({ cvData, accentColor }),
      )
      const paginatedRight = paginateColumn(
        Array.from(rightContainer.children) as HTMLElement[],
        CVColumnRight({ cvData, accentColor }),
      )

      const numPages = Math.max(paginatedLeft.length, paginatedRight.length)
      const finalPages = []

      for (let i = 0; i < numPages; i++) {
        finalPages.push(
          <Page key={i}>
            {i === 0 && <CVHeader cvData={cvData} />}
            <div className="grid grid-cols-[250px_1fr] gap-x-12">
              <div>{paginatedLeft[i] || []}</div>
              <div>{paginatedRight[i] || []}</div>
            </div>
          </Page>,
        )
      }

      setPaginatedPages(finalPages)
      setIsCalculating(false)
    }

    const timer = setTimeout(measureAndPaginate, 100)
    return () => clearTimeout(timer)
  }, [cvData, accentColor])

  return (
    <div className="bg-gray-200 p-8">
      {/* 1. Hidden Renderer for Measurement */}
      <div
        className="absolute opacity-0 -z-10 w-[794px]"
        style={{
          paddingLeft: `${PAGE_PADDING_PX}px`,
          paddingRight: `${PAGE_PADDING_PX}px`,
        }}
      >
        <div ref={headerRef}>
          <CVHeader cvData={cvData} isMeasurement />
        </div>
        <div className="grid grid-cols-[250px_1fr] gap-x-12">
          <div ref={leftColRef}>{CVColumnLeft({ cvData, accentColor })}</div>
          <div ref={rightColRef}>{CVColumnRight({ cvData, accentColor })}</div>
        </div>
      </div>

      {/* 2. Visible Renderer */}
      {isCalculating ? (
        <Page>
          <div>Calculating layout...</div>
        </Page>
      ) : (
        paginatedPages
      )}
    </div>
  )
}

// --- Sub-Components for Content ---

function CVHeader({
  cvData,
  isMeasurement = false,
}: CVCleanTemplateProps & { isMeasurement?: boolean }) {
  const paddingClass = isMeasurement ? `pt-8 pb-4` : ``

  // Check if there's a valid profile image
  const hasImage =
    cvData.personalInformation?.profile_url &&
    isValidUrl(cvData.personalInformation.profile_url)

  return (
    <div className={`flex items-start justify-between ${paddingClass}`}>
      <div className="flex-1 pr-8">
        <h1 className="text-3xl font-bold text-black mb-1 leading-tight">
          {cvData.personalInformation?.name}{' '}
          {cvData.personalInformation?.surname}
        </h1>
        <h2 className="text-lg text-gray-700 font-normal mb-4 leading-tight">
          {cvData.personalInformation?.professionalTitle}
        </h2>
        {cvData.personalInformation?.summary && (
          <p
            className={`text-sm text-gray-800 mb-6 ${
              hasImage ? 'max-w-md' : 'max-w-full'
            }`}
            style={{ lineHeight: '1.5' }}
          >
            {cvData.personalInformation?.summary}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {hasImage && cvData.personalInformation && (
          <Image
            src={cvData.personalInformation.profile_url!}
            alt={`${cvData.personalInformation.name} ${cvData.personalInformation.surname}`}
            width={130}
            height={130}
            className="w-[130px] h-[130px] rounded-full object-cover"
          />
        )}
      </div>
    </div>
  )
}

function CVColumnLeft({
  cvData,
  accentColor,
}: CVCleanTemplateProps): ReactNode[] {
  const sections: ReactNode[] = []

  sections.push(
    <div key="contact" className="mb-6">
      <div className="space-y-2 text-xs">
        {cvData.personalInformation?.email && (
          <a
            href={`mailto:${cvData.personalInformation.email}`}
            className="flex items-center gap-2"
          >
            <IconMail size={14} className="text-gray-500" />
            <span>{cvData.personalInformation.email}</span>
          </a>
        )}
        {cvData.personalInformation?.phone && (
          <a
            href={`tel:${cvData.personalInformation.phone}`}
            className="flex items-center gap-2"
          >
            <IconPhone size={14} className="text-gray-500" />
            <span>{cvData.personalInformation.phone}</span>
          </a>
        )}
        {cvData.personalInformation?.website && (
          <a
            href={cvData.personalInformation.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconGlobe size={14} className="text-gray-500" />
            <span>
              {cvData.personalInformation.website.replace('https://', '')}
            </span>
          </a>
        )}
        {cvData.personalInformation?.linkedin && (
          <a
            href={cvData.personalInformation.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconBrandLinkedin size={14} className="text-gray-500" />
            <span>
              {getLinkedInUsername(cvData.personalInformation.linkedin)}
            </span>
          </a>
        )}
        {cvData.personalInformation?.xing && (
          <a
            href={cvData.personalInformation.xing}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconBrandXing size={14} className="text-gray-500" />
            <span>{getXingUsername(cvData.personalInformation.xing)}</span>
          </a>
        )}
      </div>
    </div>,
  )

  if (cvData.education && cvData.education.length > 0) {
    sections.push(
      <div key="education" className="mb-6">
        <h3 className={`text-sm font-bold ${accentColor} tracking-wide mb-1.5`}>
          Education
        </h3>
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <div key={index} className="text-xs">
              <p className="font-semibold text-black mb-1">{edu.degree}</p>
              <p className="text-gray-800">{edu.institution}</p>
              <p className="text-gray-500 mt-1">
                {edu?.startDate && formatDate(edu?.startDate)} -{' '}
                {edu.currentlyStudyingHere ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'Present')} • {edu.location}
              </p>
              {edu.description && (
                <p className="text-gray-800 mt-1">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>,
    )
  }

  cvData.skillGroups?.forEach((skillGroup, groupIndex) => {
    sections.push(
      <div key={`skill-group-${groupIndex}`} className="mb-6">
        <h3 className={`text-sm font-bold ${accentColor} tracking-wide mb-1.5`}>
          {skillGroup.name}
        </h3>
        <div className="text-xs text-gray-800 space-y-1">
          {skillGroup.skills?.map((skill, skillIndex) => (
            <p key={skillIndex}>{skill.name}</p>
          ))}
        </div>
      </div>,
    )
  })

  return sections
}

function CVColumnRight({
  cvData,
  accentColor,
}: CVCleanTemplateProps): ReactNode[] {
  const sections: ReactNode[] = []

  if (cvData.experience && cvData.experience.length > 0) {
    sections.push(
      <div key="experience" className="mb-6">
        <h3 className={`text-sm font-bold ${accentColor} tracking-wide mb-1.5`}>
          Experience
        </h3>
        <div className="space-y-5 text-xs">
          {cvData.experience?.map((work, index) => (
            <div key={index}>
              <p className="font-semibold text-black mb-1">{work.role}</p>
              <p className=" text-gray-800 mb-1">{work.company}</p>
              <p className="text-xs text-gray-500 mb-2">
                {work.startDate && formatDate(work.startDate)} -{' '}
                {work.currentlyWorkingHere ? 'Present' : (work.endDate ? formatDate(work.endDate) : 'Present')} • {work.location}
              </p>
              <div
                className="text-xs text-gray-800"
                style={{ lineHeight: '1.5' }}
              >
                {work.description}
              </div>
            </div>
          ))}
        </div>
      </div>,
    )
  }

  return sections
}

// 'use client'

// import React from 'react'
// import Image from 'next/image'
// import { CVData } from '@/types/cv-data'
// import { formatDate } from '@/utils/date-formatting'
// import {
//   isValidUrl,
//   getLinkedInUsername,
//   getXingUsername,
// } from '@/utils/cv-helpers'
// import {
//   IconGlobe,
//   IconMail,
//   IconPhone,
//   IconBrandLinkedin,
//   IconBrandXing,
// } from '@tabler/icons-react'

// interface CVCleanTemplateProps {
//   cvData: CVData
//   accentColor?: string
// }

// export function CVCleanTemplate({
//   cvData,
//   accentColor = 'text-blue-600',
// }: CVCleanTemplateProps) {
//   return (
//     <div
//       className="w-[794px] h-[1123px] bg-white shadow-lg mx-auto relative overflow-hidden print:shadow-none"
//       style={{ fontSize: '11px', lineHeight: '1.3' }}
//     >
//       {/* Header Section */}
//       <div className="flex items-start justify-between px-12 pt-12 pb-4">
//         {/* Left side - Name and Title */}
//         <div className="flex-1 pr-8">
//           <h1 className="text-3xl font-bold text-black mb-1 leading-tight">
//             {cvData.personalInformation?.name}{' '}
//             {cvData.personalInformation?.surname}
//           </h1>
//           {cvData.personalInformation?.professionalTitle && (
//             <h2 className="text-lg text-black font-normal mb-4 leading-tight">
//               {cvData.personalInformation?.professionalTitle}
//             </h2>
//           )}

//           {/* Summary */}
//           {cvData.personalInformation?.summary && (
//             <p
//               className="text-sm text-gray-600 font-semibold max-w-lg"
//               style={{ lineHeight: '1.5' }}
//             >
//               {cvData.personalInformation?.summary}
//             </p>
//           )}
//         </div>

//         {/* Right side - Photo */}
//         <div className="flex-shrink-0 ">
//           {cvData.personalInformation?.profile_url &&
//             isValidUrl(cvData.personalInformation.profile_url) && (
//               <Image
//                 src={cvData.personalInformation.profile_url}
//                 alt={`${cvData.personalInformation.name} ${cvData.personalInformation.surname}`}
//                 width={130}
//                 height={130}
//                 className="w-[130px] h-[130px] rounded-full object-cover"
//               />
//             )}
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div
//         className="grid grid-cols-[300px_1fr] gap-8 px-12 py-8"
//         style={{ lineHeight: '1.3' }}
//       >
//         {/* Left Column */}
//         <div className="space-y-6">
//           {/* Contact Information */}
//           <div>
//             <div
//               className="space-y-2 text-sm text-gray-600"
//               style={{ lineHeight: '1.4' }}
//             >
//               {cvData.personalInformation?.email && (
//                 <a
//                   href={`mailto:${cvData.personalInformation.email}`}
//                   className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   <IconMail className="w-3 h-3" />
//                   <span>{cvData.personalInformation.email}</span>
//                 </a>
//               )}
//               {cvData.personalInformation?.phone && (
//                 <a
//                   href={`tel:${cvData.personalInformation.phone}`}
//                   className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   <IconPhone className="w-3 h-3" />
//                   <span>{cvData.personalInformation.phone}</span>
//                 </a>
//               )}
//               {cvData.personalInformation?.website && (
//                 <a
//                   href={cvData.personalInformation.website}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   <IconGlobe className="w-3 h-3" />
//                   <span>
//                     {cvData.personalInformation.website.replace('https://', '')}
//                   </span>
//                 </a>
//               )}
//               {cvData.personalInformation?.linkedin && (
//                 <a
//                   href={cvData.personalInformation.linkedin}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   <IconBrandLinkedin className="w-3 h-3" />
//                   <span>
//                     {getLinkedInUsername(cvData.personalInformation.linkedin)}
//                   </span>
//                 </a>
//               )}
//               {cvData.personalInformation?.xing && (
//                 <a
//                   href={cvData.personalInformation.xing}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   <IconBrandXing className="w-3 h-3" />
//                   <span>
//                     {getXingUsername(cvData.personalInformation.xing)}
//                   </span>
//                 </a>
//               )}
//             </div>
//           </div>

//           {/* Education */}
//           <div>
//             <h3 className={`text-base font-semibold ${accentColor} mb-2`}>
//               Education
//             </h3>
//             <div className="space-y-3">
//               {cvData.education?.map((edu, index) => (
//                 <div
//                   key={index}
//                   className="text-xs"
//                   style={{ lineHeight: '1.3' }}
//                 >
//                   <div className="font-semibold text-black mb-0.5">
//                     {edu.degree}
//                   </div>
//                   <div className="text-black mb-1">{edu.institution}</div>
//                   <div className="text-gray-500 font-medium">
//                     {edu?.startDate && formatDate(edu?.startDate)} -{' '}
//                     {edu.currentlyStudyingHere ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'Present')}
//                     {edu.location && ` • ${edu.location}`}
//                   </div>
//                   {edu.description && (
//                     <div className="text-gray-600 mt-1">{edu.description}</div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Skills Groups */}
//           {cvData.skillGroups &&
//             cvData.skillGroups
//               .sort((a, b) => (a.order || 0) - (b.order || 0))
//               .map((skillGroup, groupIndex) => (
//                 <div key={groupIndex}>
//                   <h3 className={`text-base font-semibold ${accentColor} mb-2`}>
//                     {skillGroup.name}
//                   </h3>
//                   <div className="space-y-1">
//                     {skillGroup.skills &&
//                       skillGroup.skills
//                         .sort((a, b) =>
//                           a.order && b.order ? a.order - b.order : 0,
//                         )
//                         .map((skill, skillIndex) => (
//                           <div
//                             key={skillIndex}
//                             className="text-xs text-black"
//                             style={{ lineHeight: '1.3' }}
//                           >
//                             {skill.name}
//                           </div>
//                         ))}
//                   </div>
//                 </div>
//               ))}
//         </div>

//         {/* Right Column */}
//         <div className="space-y-6">
//           {/* Work Experience */}
//           <div>
//             <h3 className={`text-base font-semibold ${accentColor} mb-2`}>
//               Experience
//             </h3>
//             <div className="space-y-5">
//               {cvData.experience &&
//                 cvData.experience.map((work, index) => (
//                   <div key={index}>
//                     <div className="mb-2">
//                       {/* Role - more emphasis */}
//                       <h4
//                         className="text-sm font-bold text-black mb-0.5"
//                         style={{ lineHeight: '1.2' }}
//                       >
//                         {work.role}
//                       </h4>
//                       {/* Company - secondary */}
//                       <div
//                         className="text-sm font-medium text-gray-700 mb-1"
//                         style={{ lineHeight: '1.3' }}
//                       >
//                         {work.company}
//                       </div>
//                       {/* Date and location */}
//                       <div
//                         className="text-xs text-gray-500 font-medium"
//                         style={{ lineHeight: '1.3' }}
//                       >
//                         {work.startDate && formatDate(work.startDate)} -{' '}
//                         {work.currentlyWorkingHere ? 'Present' : (work.endDate ? formatDate(work.endDate) : 'Present')}
//                         {work.location && ` | ${work.location}`}
//                       </div>
//                     </div>
//                     {/* Description as continuous text */}
//                     {work.description && (
//                       <div
//                         className="text-xs text-black"
//                         style={{ lineHeight: '1.5' }}
//                       >
//                         {work.description}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
