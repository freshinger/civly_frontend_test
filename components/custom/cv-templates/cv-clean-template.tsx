"use client";

import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { CvData } from "@/schemas/cv_data_schema";
import type { SkillGroup, SkillGroupItem } from "@/schemas/skills_schema";
import type { EducationItem } from "@/schemas/education_schema";
import type { ExperienceItem } from "@/schemas/experience_schema";
// import { formatDate } from "@/utils/date-formatting";
import { getLinkedInUsername, getXingUsername } from "@/utils/cv-utils";
import {
  getElementClasses,
  getFontStyles,
  type FontSizeId,
} from "@/lib/style-utils";
import { ColorRecord } from "@/types/colorType";
import {
  IconGlobe,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandLinkedin,
  IconBrandXing,
} from "@tabler/icons-react";
import { useImageStore } from "@/stores/image_store";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// --- Types ---

interface CVCleanTemplateProps {
  cvData: CvData;
  accentColor?: string;
  colorId?: number;
  fontId?: number;
  fontSizeId?: 10 | 11 | 12;
  image?: string;
}

// --- Layout Constants ---
const A4_PAGE_WIDTH_PX = 794;
const A4_PAGE_HEIGHT_PX = 1123;
const PAGE_PADDING_PX = 40;
const PAGE_PADDING_Y_PX = PAGE_PADDING_PX * 2;
const USABLE_PAGE_HEIGHT_SUBSEQUENT = A4_PAGE_HEIGHT_PX - PAGE_PADDING_Y_PX;

// --- Visual Page Component ---
function Page({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-white shadow-lg overflow-auto relative max-w-full"
      style={{
        width: `${A4_PAGE_WIDTH_PX}px`,
        height: `${A4_PAGE_HEIGHT_PX}px`,
        padding: `${PAGE_PADDING_PX}px`,
        fontSize: "11px",
        lineHeight: "1.3",
        margin: "0 auto 50px auto",
      }}
    >
      {children}
    </div>
  );
}

// --- Main Template Component with Pagination Logic ---
export default function CVCleanTemplate({
  cvData,
  accentColor = "text-blue-600",
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVCleanTemplateProps) {
  const [paginatedPages, setPaginatedPages] = useState<ReactNode[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);

  // State to hold the final, balanced layout
  const [balancedLayout, setBalancedLayout] = useState<{
    left: ReactNode[];
    right: ReactNode[];
  } | null>(null);

  // Refs for measurement containers
  const headerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // STEP 1: Balance the columns based on initial measurements.
  useEffect(() => {
    // This effect runs once to decide if Education should be moved.
    const timer = setTimeout(() => {
      const headerEl = headerRef.current;
      const leftEl = leftColRef.current;
      const rightEl = rightColRef.current;

      if (!headerEl || !leftEl || !rightEl) {
        setIsCalculating(false);
        return;
      }

      const getBlockHeight = (block: HTMLElement) => {
        const style = window.getComputedStyle(block);
        return (
          block.offsetHeight +
          parseInt(style.marginTop, 10) +
          parseInt(style.marginBottom, 10)
        );
      };

      const headerHeight = getBlockHeight(headerEl);
      const usableHeightPage1 = A4_PAGE_HEIGHT_PX - PAGE_PADDING_Y_PX;

      // Simplified layout: Education always on right column after Experience
      const finalLeftJsx: ReactNode[] = CVColumnLeftFixed({
        cvData,
        accentColor,
        colorId,
        fontId,
        fontSizeId,
      });
      const finalRightJsx: ReactNode[] = CVColumnRight({
        cvData,
        accentColor,
        colorId,
        fontId,
        fontSizeId,
      });

      setBalancedLayout({ left: finalLeftJsx, right: finalRightJsx });
    }, 50); // A small delay to ensure DOM is ready for measurement.

    return () => clearTimeout(timer);
  }, [cvData, accentColor, colorId, fontId, fontSizeId]);

  // STEP 2: Paginate the final, balanced layout.
  useEffect(() => {
    if (!balancedLayout) return;

    // This effect runs after the balanced layout is determined.
    const timer = setTimeout(() => {
      const headerEl = headerRef.current;
      const leftEl = leftColRef.current;
      const rightEl = rightColRef.current;
      if (!headerEl || !leftEl || !rightEl) {
        setIsCalculating(false);
        return;
      }

      const getBlockHeight = (block: HTMLElement) => {
        const style = window.getComputedStyle(block);
        return (
          block.offsetHeight +
          parseInt(style.marginTop, 10) +
          parseInt(style.marginBottom, 10)
        );
      };

      const headerHeight = getBlockHeight(headerEl);
      const usableHeightPage1 =
        A4_PAGE_HEIGHT_PX - headerHeight - PAGE_PADDING_Y_PX;

      const paginateColumn = (
        container: HTMLElement,
        originalJsx: ReactNode[]
      ) => {
        const pages: ReactNode[][] = [];
        if (!container || originalJsx.length === 0) return pages;

        const blocks = Array.from(container.children) as HTMLElement[];
        let currentPage: ReactNode[] = [];
        let currentPageHeight = 0;
        let isFirstPage = true;

        blocks.forEach((block, index) => {
          const blockHeight = getBlockHeight(block);
          const usableHeight = isFirstPage
            ? usableHeightPage1
            : USABLE_PAGE_HEIGHT_SUBSEQUENT;
          if (
            currentPageHeight + blockHeight > usableHeight &&
            currentPage.length > 0
          ) {
            pages.push(currentPage);
            currentPage = [originalJsx[index]];
            currentPageHeight = blockHeight;
            isFirstPage = false;
          } else {
            currentPage.push(originalJsx[index]);
            currentPageHeight += blockHeight;
          }
        });
        if (currentPage.length > 0) pages.push(currentPage);
        return pages;
      };

      const paginatedLeft = paginateColumn(leftEl, balancedLayout.left);
      const paginatedRight = paginateColumn(rightEl, balancedLayout.right);

      const numPages = Math.max(paginatedLeft.length, paginatedRight.length);
      const finalPages = [];

      for (let i = 0; i < numPages; i++) {
        finalPages.push(
          <Page key={i}>
            {i === 0 && (
              <CVHeader
                cvData={cvData}
                colorId={colorId}
                fontId={fontId}
                fontSizeId={fontSizeId}
              />
            )}
            <div className="grid grid-cols-[250px_1fr] gap-x-12">
              <div>{paginatedLeft[i] || []}</div>
              <div>{paginatedRight[i] || []}</div>
            </div>
          </Page>
        );
      }
      setPaginatedPages(finalPages);
      setIsCalculating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [balancedLayout, cvData, colorId, fontId, fontSizeId]);

  return (
    <div>
      {/* 1. Hidden Renderer for Measurement - Renders based on the balanced layout */}
      <div
        className="absolute opacity-0 -z-10 w-full max-w-[794px]"
        style={{ padding: `0 ${PAGE_PADDING_PX}px` }}
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
        <div className="grid grid-cols-[250px_1fr] gap-x-12">
          <div ref={leftColRef}>
            {balancedLayout
              ? balancedLayout.left
              : CVColumnLeftFixed({
                  cvData,
                  accentColor,
                  colorId,
                  fontId,
                  fontSizeId,
                })}
          </div>
          <div ref={rightColRef}>
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
  );
}

// --- Sub-Components for Content ---
function CVHeader({
  cvData,
  isMeasurement = false,
  fontId = 0,
  fontSizeId = 11,
}: CVCleanTemplateProps & { isMeasurement?: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const profileUrl = cvData?.personalInformation?.profileUrl;
  const setImage = useImageStore((s) => s.setImage);
  const removeImage = useImageStore((s) => s.removeImage);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profileUrl) return;

    let cancelled = false;

    async function fetchImage() {
      try {
        const { data, error } = await supabase.storage
          .from("cv_picture")
          .download(profileUrl!);

        if (error) throw error;
        if (!data) return;

        if (cancelled) return;

        // cleanup old URL
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const objUrl = URL.createObjectURL(data);
        objectUrlRef.current = objUrl;

        setImage(profileUrl!, objUrl);
      } catch (err) {
        toast.error("Error downloading image");
        removeImage(profileUrl!);
      }
    }

    fetchImage();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [profileUrl, setImage, removeImage]);
  const image = useImageStore((state) =>
    profileUrl ? state.images[profileUrl] : ""
  );
  const paddingClass = isMeasurement ? `pt-8 pb-4` : ``;
  // Get dynamic classes for different elements
  const nameClasses = getElementClasses(
    "h1",
    fontSizeId as FontSizeId,
    fontId,
    "font-bold text-black mb-1 leading-tight"
  );
  const titleClasses = getElementClasses(
    "h2",
    fontSizeId as FontSizeId,
    fontId,
    "text-gray-700 font-normal mb-4 leading-tight"
  );
  const summaryClasses = getElementClasses(
    "body",
    fontSizeId as FontSizeId,
    fontId,
    "text-gray-800 mb-6"
  );

  // Import the font styles utility
  const nameFontStyles = getFontStyles("h1", fontId);
  const titleFontStyles = getFontStyles("h2", fontId);
  const summaryFontStyles = getFontStyles("body", fontId);

  return (
    <div className={`flex items-start ${paddingClass}`}>
      <div className="flex-1">
        <h1 className={nameClasses} style={nameFontStyles}>
          {cvData?.personalInformation?.name}{" "}
          {cvData?.personalInformation?.surname}
        </h1>
        <h2 className={titleClasses} style={titleFontStyles}>
          {cvData?.personalInformation?.professionalTitle}
        </h2>
        {cvData?.personalInformation?.summary && (
          <p
            className={`${summaryClasses.replace("mb-6", "mb-8")} ${
              image ? "max-w-md" : "max-w-full"
            }`}
            style={{ lineHeight: "1.5" }}
          >
            {cvData?.personalInformation?.summary}
          </p>
        )}
      </div>
      <div className="w-40 flex justify-center flex-shrink-0">
        {image && (
          <Image
            src={image}
            alt={`${cvData?.personalInformation?.name} ${cvData?.personalInformation?.surname}`}
            width={130}
            height={130}
            className="w-[130px] h-[130px] rounded-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

function CVColumnLeftFixed({
  cvData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accentColor: _accentColor,
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVCleanTemplateProps): ReactNode[] {
  // Get dynamic classes for different elements
  const contactTextClasses = getElementClasses(
    "small",
    fontSizeId as FontSizeId,
    fontId,
    "text-gray-800"
  );
  const sectionHeadingClasses = getElementClasses(
    "h4",
    fontSizeId as FontSizeId,
    fontId,
    "font-bold tracking-wide mb-1.5"
  );
  const skillItemClasses = getElementClasses(
    "small",
    fontSizeId as FontSizeId,
    fontId,
    "text-gray-800"
  );

  // Get dynamic accent color using inline style instead of arbitrary Tailwind class
  const accentColorHex = ColorRecord[colorId]?.hex || "#3B82F6";

  /*
  //console.log('CVColumnLeftFixed styles:', {
    fontSizeId,
    fontId,
    colorId,
    contactTextClasses,
    sectionHeadingClasses,
    accentColorHex,
  })
    */

  const sections: ReactNode[] = [];
  sections.push(
    <div key="contact" className="mb-6" data-section="contact">
      <div className="space-y-2">
        {cvData?.personalInformation?.email && (
          <a
            href={`mailto:${cvData.personalInformation.email}`}
            className="flex items-center gap-2"
          >
            <IconMail size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {cvData.personalInformation.email}
            </span>
          </a>
        )}
        {cvData?.personalInformation?.phone && (
          <a
            href={`tel:${cvData.personalInformation.phone}`}
            className="flex items-center gap-2"
          >
            <IconPhone size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {cvData.personalInformation.phone}
            </span>
          </a>
        )}
        {cvData?.personalInformation?.website && (
          <a
            href={cvData.personalInformation.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconGlobe size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {cvData.personalInformation.website.replace("https://", "")}
            </span>
          </a>
        )}
        {cvData?.personalInformation?.linkedin && (
          <a
            href={cvData.personalInformation.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconBrandLinkedin size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {getLinkedInUsername(cvData.personalInformation.linkedin)}
            </span>
          </a>
        )}
        {cvData?.personalInformation?.xing && (
          <a
            href={cvData.personalInformation.xing}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <IconBrandXing size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {getXingUsername(cvData.personalInformation.xing)}
            </span>
          </a>
        )}
        {cvData?.personalInformation?.location && (
          <div className="flex items-center gap-2">
            <IconMapPin size={14} className="text-gray-500" />
            <span className={contactTextClasses}>
              {cvData.personalInformation.location}
            </span>
          </div>
        )}
      </div>
    </div>
  );
  cvData?.skillGroups?.forEach((skillGroup: SkillGroup, groupIndex: number) => {
    sections.push(
      <div
        key={`skill-group-${groupIndex}`}
        className="mb-6"
        data-section="skill"
      >
        <h3 className={sectionHeadingClasses} style={{ color: accentColorHex }}>
          {skillGroup.name}
        </h3>
        <div className={`${skillItemClasses} space-y-1`}>
          {skillGroup.skills?.map(
            (skill: SkillGroupItem, skillIndex: number) => (
              <p key={skillIndex}>{skill.name}</p>
            )
          )}
        </div>
      </div>
    );
  });
  return sections;
}

function CVColumnRight({
  cvData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accentColor: _accentColor,
  colorId = 0,
  fontId = 0,
  fontSizeId = 11,
}: CVCleanTemplateProps): ReactNode[] {
  // Get dynamic classes
  const sectionHeadingClasses = getElementClasses(
    "h4",
    fontSizeId as FontSizeId,
    fontId,
    "font-bold tracking-wide mb-1.5"
  );
  const experienceItemClasses = getElementClasses(
    "small",
    fontSizeId as FontSizeId,
    fontId,
    ""
  );
  const educationItemClasses = getElementClasses(
    "small",
    fontSizeId as FontSizeId,
    fontId,
    ""
  );
  const accentColorHex = ColorRecord[colorId]?.hex || "#3B82F6";

  /*
  //console.log("CVColumnRight styles:", {
    fontSizeId,
    fontId,
    colorId,
    sectionHeadingClasses,
    experienceItemClasses,
    accentColorHex,
  });
  */

  const sections: ReactNode[] = [];

  // Experience section
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
                  new Date(work.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}{" "}
                -{" "}
                {work.currentlyWorkingHere
                  ? "Present"
                  : work.endDate
                    ? new Date(work.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : "Present"}{" "}
                • {work.location}
              </p>
              <div
                className={`${experienceItemClasses} text-gray-800`}
                style={{ lineHeight: "1.5" }}
              >
                {work.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Education section - always after experience
  if (cvData?.education && cvData?.education?.length > 0) {
    sections.push(
      <div key="education" className="mb-6" data-section="education">
        <h3 className={sectionHeadingClasses} style={{ color: accentColorHex }}>
          Education
        </h3>
        <div className="space-y-4">
          {cvData?.education?.map((edu: EducationItem, index: number) => (
            <div key={index} className={educationItemClasses}>
              <p className="font-semibold text-black mb-1">{edu.degree}</p>
              <p className="text-gray-800">{edu.institution}</p>
              <p className="text-gray-500 mt-1">
                {edu?.startDate &&
                  new Date(edu?.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}{" "}
                -{" "}
                {edu.currentlyStudyingHere
                  ? "Present"
                  : edu.endDate
                    ? new Date(edu.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : "Present"}{" "}
                • {edu.location}
              </p>
              {edu.description && (
                <p className="text-gray-800 mt-1">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return sections;
}
