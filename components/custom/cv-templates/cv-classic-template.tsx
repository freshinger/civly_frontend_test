// This component MUST be a client component to perform DOM measurements.
'use client'

import React, { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { CvData } from '@/schemas/cv_data_schema'
import type { SkillGroup, SkillGroupItem } from '@/schemas/skills_schema'
import type { EducationItem } from '@/schemas/education_schema'
import type { ExperienceItem } from '@/schemas/experience_schema'
// import { formatDate } from "@/utils/date-formatting";
import { getLinkedInUsername, getXingUsername } from '@/utils/cv-utils'
import {
  getElementClasses,
  getFontStyles,
  type FontSizeId,
} from '@/lib/style-utils'
import { ColorRecord } from '@/types/colorType'
import {
  IconGlobe,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandLinkedin,
  IconBrandXing,
} from '@tabler/icons-react'
import { useImageStore } from '@/stores/image_store'
import { createClient } from '@/utils/supabase/client'

// --- Utility Functions ---
// Darkens a hex color by reducing RGB components by a percentage
function darkenHexColor(hexColor: string, percentage: number = 0.08): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse RGB components
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Darken each component
  const darkR = Math.round(r * (1 - percentage))
  const darkG = Math.round(g * (1 - percentage))
  const darkB = Math.round(b * (1 - percentage))

  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(darkR)}${toHex(darkG)}${toHex(darkB)}`
}

// --- Types ---

interface CVClassicTemplateProps {
  cvData: CvData
  accentColor?: string
  colorId?: number
  fontId?: number
  fontSizeId?: 10 | 11 | 12
  image?: string
}

// --- Layout Constants ---
const A4_PAGE_WIDTH_PX = 794
const A4_PAGE_HEIGHT_PX = 1123
const PAGE_PADDING_PX = 40
const PAGE_PADDING_Y_PX = PAGE_PADDING_PX * 2
const USABLE_PAGE_HEIGHT_SUBSEQUENT = A4_PAGE_HEIGHT_PX - PAGE_PADDING_Y_PX

// --- Visual Page Component ---
function Page({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-white shadow-lg overflow-hidden relative max-w-full"
      style={{
        width: `${A4_PAGE_WIDTH_PX}px`,
        height: `${A4_PAGE_HEIGHT_PX}px`,
        fontSize: '11px',
        lineHeight: '1.3',
        margin: '0 auto 50px auto',
      }}
    >
      {children}
    </div>
  )
}

// --- Main Template Component with Pagination Logic ---
export default function CVClassicTemplate({
  cvData,
  accentColor = 'text-blue-600',
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVClassicTemplateProps) {
  const [paginatedPages, setPaginatedPages] = useState<ReactNode[]>([])
  const [isCalculating, setIsCalculating] = useState(true)

  // State to hold the final, balanced layout
  const [balancedLayout, setBalancedLayout] = useState<{
    left: ReactNode[]
    right: ReactNode[]
  } | null>(null)

  // Refs for measurement containers
  const headerRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)

  // STEP 1: Balance the columns based on initial measurements.
  useEffect(() => {
    // This effect runs once to decide if Education should be moved.
    const timer = setTimeout(() => {
      const headerEl = headerRef.current
      const leftEl = leftColRef.current
      const rightEl = rightColRef.current

      if (!headerEl || !leftEl || !rightEl) {
        setIsCalculating(false)
        return
      }

      const getBlockHeight = (block: HTMLElement) => {
        const style = window.getComputedStyle(block)
        return (
          block.offsetHeight +
          parseInt(style.marginTop, 10) +
          parseInt(style.marginBottom, 10)
        )
      }

      const headerHeight = getBlockHeight(headerEl)
      const usableHeightPage1 =
        A4_PAGE_HEIGHT_PX - headerHeight - PAGE_PADDING_Y_PX

      const leftBlocks = Array.from(leftEl.children) as HTMLElement[]
      const rightBlocks = Array.from(rightEl.children) as HTMLElement[]

      const educationBlock = leftBlocks.find(
        (el) => el.getAttribute('data-section') === 'education',
      )
      const leftFixedHeight = leftBlocks
        .filter((el) => el.getAttribute('data-section') !== 'education')
        .reduce((sum, block) => sum + getBlockHeight(block), 0)
      const educationHeight = educationBlock
        ? getBlockHeight(educationBlock)
        : 0
      const rightHeight = rightBlocks.reduce(
        (sum, block) => sum + getBlockHeight(block),
        0,
      )

      let finalLeftJsx: ReactNode[] = []
      const finalRightJsx: ReactNode[] = CVColumnRight({
        cvData,
        accentColor,
        colorId,
        fontId,
        fontSizeId,
      })

      const shouldMoveEducation =
        educationHeight > 0 &&
        leftFixedHeight + educationHeight > usableHeightPage1 &&
        rightHeight + educationHeight <= usableHeightPage1

      if (shouldMoveEducation) {
        finalLeftJsx = CVColumnLeft({
          cvData,
          accentColor,
          colorId,
          fontId,
          fontSizeId,
        })
        // For now, don't move education - keep it in the sidebar
      } else {
        finalLeftJsx = CVColumnLeft({
          cvData,
          accentColor,
          colorId,
          fontId,
          fontSizeId,
        })
      }

      setBalancedLayout({ left: finalLeftJsx, right: finalRightJsx })
    }, 50) // A small delay to ensure DOM is ready for measurement.

    return () => clearTimeout(timer)
  }, [cvData, accentColor, colorId, fontId, fontSizeId])

  // STEP 2: Paginate the final, balanced layout.
  useEffect(() => {
    if (!balancedLayout) return

    // This effect runs after the balanced layout is determined.
    const timer = setTimeout(() => {
      const headerEl = headerRef.current
      const leftEl = leftColRef.current
      const rightEl = rightColRef.current
      if (!headerEl || !leftEl || !rightEl) {
        setIsCalculating(false)
        return
      }

      const getBlockHeight = (block: HTMLElement) => {
        const style = window.getComputedStyle(block)
        return (
          block.offsetHeight +
          parseInt(style.marginTop, 10) +
          parseInt(style.marginBottom, 10)
        )
      }

      const headerHeight = getBlockHeight(headerEl)
      const usableHeightPage1 =
        A4_PAGE_HEIGHT_PX - headerHeight - PAGE_PADDING_Y_PX

      const paginateColumn = (
        container: HTMLElement,
        originalJsx: ReactNode[],
      ) => {
        const pages: ReactNode[][] = []
        if (!container || originalJsx.length === 0) return pages

        const blocks = Array.from(container.children) as HTMLElement[]
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

      const paginatedLeft = paginateColumn(leftEl, balancedLayout.left)
      const paginatedRight = paginateColumn(rightEl, balancedLayout.right)

      const numPages = Math.max(paginatedLeft.length, paginatedRight.length)
      const finalPages = []

      for (let i = 0; i < numPages; i++) {
        finalPages.push(
          <Page key={i}>
            <div className="grid grid-cols-[320px_1fr] h-full">
              {/* Left Column - Sidebar with accent background that bleeds to edges */}
              <div
                className="min-h-full"
                style={{
                  backgroundColor: darkenHexColor(
                    ColorRecord[colorId]?.hex || '#3B82F6',
                    0.25,
                  ),
                  marginLeft: `-${PAGE_PADDING_PX}px`,
                  marginTop: `-${PAGE_PADDING_PX}px`,
                  marginBottom: `-${PAGE_PADDING_PX}px`,
                  paddingLeft: `${PAGE_PADDING_PX + 24}px`, // PAGE_PADDING_PX + original px-6 (24px)
                  paddingTop: `${PAGE_PADDING_PX + 32}px`, // PAGE_PADDING_PX + original py-8 (32px)
                  paddingBottom: `${PAGE_PADDING_PX + 32}px`,
                  minHeight: `calc(100% + ${PAGE_PADDING_PX * 2}px)`,
                }}
              >
                {paginatedLeft[i] || []}
              </div>
              {/* Right Column - Main content with proper padding */}
              <div
                className="h-full"
                style={{
                  paddingLeft: '32px', // px-8
                  paddingRight: `${PAGE_PADDING_PX}px`,
                  paddingTop: `${PAGE_PADDING_PX}px`,
                  paddingBottom: `${PAGE_PADDING_PX}px`,
                }}
              >
                {i === 0 && (
                  <CVHeader
                    cvData={cvData}
                    colorId={colorId}
                    fontId={fontId}
                    fontSizeId={fontSizeId}
                  />
                )}
                {paginatedRight[i] || []}
              </div>
            </div>
          </Page>,
        )
      }
      setPaginatedPages(finalPages)
      setIsCalculating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [balancedLayout, cvData, colorId, fontId, fontSizeId])

  return (
    <div>
      {/* 1. Hidden Renderer for Measurement - Renders based on the balanced layout */}
      <div
        className="absolute opacity-0 -z-10 w-full max-w-[794px]"
        style={{ padding: `0 ${PAGE_PADDING_PX}px` }}
      >
        <div className="grid grid-cols-[320px_1fr] h-full">
          <div
            className="min-h-full"
            style={{
              backgroundColor: darkenHexColor(
                ColorRecord[colorId]?.hex || '#3B82F6',
                0.25,
              ),
              marginLeft: `-${PAGE_PADDING_PX}px`,
              marginTop: `-${PAGE_PADDING_PX}px`,
              marginBottom: `-${PAGE_PADDING_PX}px`,
              paddingLeft: `${PAGE_PADDING_PX + 24}px`,
              paddingTop: `${PAGE_PADDING_PX + 32}px`,
              paddingBottom: `${PAGE_PADDING_PX + 32}px`,
              minHeight: `calc(100% + ${PAGE_PADDING_PX * 2}px)`,
            }}
            ref={leftColRef}
          >
            {balancedLayout
              ? balancedLayout.left
              : CVColumnLeft({
                  cvData,
                  accentColor,
                  colorId,
                  fontId,
                  fontSizeId,
                })}
          </div>
          <div
            className="h-full"
            style={{
              paddingLeft: '32px',
              paddingRight: `${PAGE_PADDING_PX}px`,
              paddingTop: `${PAGE_PADDING_PX}px`,
              paddingBottom: `${PAGE_PADDING_PX}px`,
            }}
            ref={rightColRef}
          >
            <div ref={headerRef}>
              <CVHeader
                cvData={cvData}
                isMeasurement
                colorId={colorId}
                fontId={fontId}
                fontSizeId={fontSizeId}
              />
            </div>
            {balancedLayout
              ? balancedLayout.right
              : CVColumnRight({
                  cvData,
                  accentColor,
                  colorId,
                  fontId,
                  fontSizeId,
                })}
          </div>
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

// --- CVHeader Component (Name, Title, Summary) ---
function CVHeader({
  cvData,
  isMeasurement = false,
  fontId = 0,
  fontSizeId = 11,
}: CVClassicTemplateProps & { isMeasurement?: boolean }) {
  const paddingClass = isMeasurement ? `py-4` : ``

  // Get dynamic classes for different elements
  const nameClasses = getElementClasses(
    'h1',
    fontSizeId as FontSizeId,
    fontId,
    'font-bold text-black mb-2 leading-tight',
  )
  const titleClasses = getElementClasses(
    'h2',
    fontSizeId as FontSizeId,
    fontId,
    'text-gray-700 font-normal mb-4 leading-tight',
  )
  const summaryClasses = getElementClasses(
    'body',
    fontSizeId as FontSizeId,
    fontId,
    'text-gray-800 mb-6',
  )

  // Import the font styles utility
  const nameFontStyles = getFontStyles('h1', fontId)
  const titleFontStyles = getFontStyles('h2', fontId)

  return (
    <div className={paddingClass}>
      <h1 className={nameClasses} style={nameFontStyles}>
        {cvData?.personalInformation?.name}{' '}
        {cvData?.personalInformation?.surname}
      </h1>
      <h2 className={titleClasses} style={titleFontStyles}>
        {cvData?.personalInformation?.professionalTitle}
      </h2>
      {cvData?.personalInformation?.summary && (
        <p className={summaryClasses} style={{ lineHeight: '1.5' }}>
          {cvData?.personalInformation?.summary}
        </p>
      )}
    </div>
  )
}

// --- Left Column Components (Profile Photo + Contact + Skills + Education) ---
function CVSidebar({
  cvData,
  fontId = 0,
  fontSizeId = 11,
}: {
  cvData: CvData
  accentColor?: string
  colorId?: number
  fontId?: number
  fontSizeId?: 10 | 11 | 12
}) {
  const supabase = useMemo(() => createClient(), [])
  const profileUrl = cvData?.personalInformation?.profileUrl
  const setImage = useImageStore((s) => s.setImage)
  const removeImage = useImageStore((s) => s.removeImage)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!profileUrl) return

    let cancelled = false

    async function fetchImage() {
      try {
        const { data, error } = await supabase.storage
          .from('cv_picture')
          .download(profileUrl!)

        if (error) throw error
        if (!data) return

        if (cancelled) return

        // cleanup old URL
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }

        const objUrl = URL.createObjectURL(data)
        objectUrlRef.current = objUrl

        setImage(profileUrl!, objUrl)
      } catch (err) {
        console.error('Error downloading image:', err)
        removeImage(profileUrl!)
      }
    }

    fetchImage()

    return () => {
      cancelled = true
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [profileUrl, setImage, removeImage, supabase.storage])

  const image = useImageStore((state) =>
    profileUrl ? state.images[profileUrl] : '',
  )

  return (
    <div className="space-y-6">
      {/* Profile Photo - Only show if image exists */}
      <div className="flex justify-center mb-8">
        {image ? (
          <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
            <Image
              src={image}
              alt={`${cvData?.personalInformation?.name} ${cvData?.personalInformation?.surname}`}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        ) : (
          <div className="w-32 h-32" /> // Empty space to maintain layout alignment
        )}
      </div>

      {/* Contact Information */}
      <CVColumnContact
        cvData={cvData}
        fontId={fontId}
        fontSizeId={fontSizeId}
      />

      {/* Skills */}
      <CVColumnSkills cvData={cvData} fontId={fontId} fontSizeId={fontSizeId} />

      {/* Education */}
      <CVColumnEducation
        cvData={cvData}
        fontId={fontId}
        fontSizeId={fontSizeId}
      />
    </div>
  )
}

function CVColumnContact({
  cvData,
  fontId = 0,
  fontSizeId = 11,
}: {
  cvData: CvData
  fontId?: number
  fontSizeId?: 10 | 11 | 12
}) {
  const contactTextClasses = getElementClasses(
    'small',
    fontSizeId as FontSizeId,
    fontId,
    'text-gray-800',
  )

  if (!cvData?.personalInformation) return null

  return (
    <div>
      {/* <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
        Contact
      </h3> */}
      <div className="space-y-2">
        {cvData.personalInformation.email && (
          <a
            href={`mailto:${cvData.personalInformation.email}`}
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <IconMail size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {cvData.personalInformation.email}
            </span>
          </a>
        )}
        {cvData.personalInformation.phone && (
          <a
            href={`tel:${cvData.personalInformation.phone}`}
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <IconPhone size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {cvData.personalInformation.phone}
            </span>
          </a>
        )}
        {cvData.personalInformation.website && (
          <a
            href={cvData.personalInformation.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <IconGlobe size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {cvData.personalInformation.website.replace('https://', '')}
            </span>
          </a>
        )}
        {cvData.personalInformation.linkedin && (
          <a
            href={cvData.personalInformation.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <IconBrandLinkedin size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {getLinkedInUsername(cvData.personalInformation.linkedin)}
            </span>
          </a>
        )}
        {cvData.personalInformation.xing && (
          <a
            href={cvData.personalInformation.xing}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <IconBrandXing size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {getXingUsername(cvData.personalInformation.xing)}
            </span>
          </a>
        )}
        {cvData.personalInformation.location && (
          <div className="flex items-center gap-2 text-white/90">
            <IconMapPin size={14} />
            <span className={`${contactTextClasses} text-white`}>
              {cvData.personalInformation.location}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function CVColumnSkills({
  cvData,
  fontId = 0,
  fontSizeId = 11,
}: {
  cvData: CvData
  fontId?: number
  fontSizeId?: 10 | 11 | 12
}) {
  const skillItemClasses = getElementClasses(
    'small',
    fontSizeId as FontSizeId,
    fontId,
    'text-gray-800',
  )

  if (!cvData?.skillGroups || cvData.skillGroups.length === 0) return null

  return (
    <>
      {cvData.skillGroups.map((skillGroup: SkillGroup, groupIndex: number) => (
        <div key={`skill-group-${groupIndex}`}>
          <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
            {skillGroup.name}
          </h3>
          <div className={`${skillItemClasses} space-y-1`}>
            {skillGroup.skills?.map(
              (skill: SkillGroupItem, skillIndex: number) => (
                <p key={skillIndex} className="text-white/90">
                  {skill.name}
                </p>
              ),
            )}
          </div>
        </div>
      ))}
    </>
  )
}

function CVColumnEducation({
  cvData,
  fontId = 0,
  fontSizeId = 11,
}: {
  cvData: CvData
  fontId?: number
  fontSizeId?: 10 | 11 | 12
}) {
  const educationItemClasses = getElementClasses(
    'small',
    fontSizeId as FontSizeId,
    fontId,
    '',
  )

  if (!cvData?.education || cvData.education.length === 0) return null

  return (
    <div>
      <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
        Education
      </h3>
      <div className="space-y-4">
        {cvData.education.map((edu: EducationItem, index: number) => (
          <div key={index} className={educationItemClasses}>
            <p className="font-semibold text-white mb-1">{edu.degree}</p>
            <p className="text-white/90 font-medium">{edu.institution}</p>
            <p className="text-white/70 font-medium mt-1 text-xs">
              {edu?.startDate &&
                new Date(edu?.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}{' '}
              -{' '}
              {edu.currentlyStudyingHere
                ? 'Present'
                : edu.endDate
                ? new Date(edu.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })
                : 'Present'}{' '}
              • {edu.location}
            </p>
            {edu.description && (
              <p className="text-white/80 mt-1 font-medium text-sm">
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper to get all left column content combined
function CVColumnLeft({
  cvData,
  accentColor,
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVClassicTemplateProps): ReactNode[] {
  return [
    <CVSidebar
      key="sidebar"
      cvData={cvData}
      accentColor={accentColor}
      colorId={colorId}
      fontId={fontId}
      fontSizeId={fontSizeId}
    />,
  ]
}

function CVColumnRight({
  cvData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accentColor: _accentColor,
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVClassicTemplateProps): ReactNode[] {
  // Get dynamic classes
  const sectionHeadingClasses = getElementClasses(
    'h4',
    fontSizeId as FontSizeId,
    fontId,
    'font-bold tracking-wide mb-1.5',
  )
  const experienceItemClasses = getElementClasses(
    'small',
    fontSizeId as FontSizeId,
    fontId,
    '',
  )
  const accentColorHex = ColorRecord[colorId]?.hex || '#3B82F6'

  console.log('CVColumnRight styles:', {
    fontSizeId,
    fontId,
    colorId,
    sectionHeadingClasses,
    experienceItemClasses,
    accentColorHex,
  })

  const sections: ReactNode[] = []
  if (cvData?.experience && cvData?.experience?.length > 0) {
    sections.push(
      <div key="experience" className="mb-6" data-section="experience">
        <h3 className={sectionHeadingClasses} style={{ color: accentColorHex }}>
          Experience
        </h3>
        <div className="space-y-5">
          {cvData?.experience?.map((work: ExperienceItem, index: number) => (
            <div key={index} className={experienceItemClasses}>
              <p className="font-semibold text-black mb-1">{work.role}</p>
              <p className="text-gray-800 mb-1">{work.company}</p>
              <p className="text-gray-500 mb-2">
                {work.startDate &&
                  new Date(work.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}{' '}
                -{' '}
                {work.currentlyWorkingHere
                  ? 'Present'
                  : work.endDate
                  ? new Date(work.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })
                  : 'Present'}{' '}
                • {work.location}
              </p>
              <div
                className={`${experienceItemClasses} text-gray-800`}
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
