'use client'

import React from 'react'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

// --- Type Definitions for Clarity ---
export interface LayoutOptions {
  // Renamed from DesignOptions
  templateId: 'modern' | 'classic' | 'ats'
  accentColor: string
  typography: 'minimalist' | 'classic' | 'modern'
  fontSize: number
}

interface LayoutTabPanelProps {
  currentOptions: LayoutOptions
  onOptionsChange: (newOptions: LayoutOptions) => void
}

// --- Data for the controls ---
const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and professional',
  },
  {
    id: 'ats',
    name: 'ATS Friendly',
    description: 'Optimized for applicant tracking systems',
  },
]

// Template visual representations using SVGs
const TemplatePreview = ({ templateId }: { templateId: string }) => {
  const getTemplateSrc = (id: string) => {
    switch (id) {
      case 'modern':
        return '/civly_modern-template.svg'
      case 'classic':
        return '/civly_classic-template.svg'
      case 'ats':
        return '/civly_ats-template.svg'
      default:
        return '/civly_modern-template.svg'
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-sm">
      <Image
        src={getTemplateSrc(templateId)}
        alt={`${templateId} template preview`}
        width={132}
        height={104}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
const colorPalette = [
  // Blues (starting with primary)
  { name: 'Classic Blue', hex: '#005eff', isPrimary: true },
  { name: 'Sky Blue', hex: '#44aaff' },
  { name: 'Cyan Blue', hex: '#44ddff' },
  // Purples
  { name: 'Royal Purple', hex: '#6644ff' },
  { name: 'Deep Purple', hex: '#8844ff' },
  // Greens
  { name: 'Emerald Green', hex: '#44ffaa' },
  { name: 'Forest Green', hex: '#22c55e' },
  { name: 'Fresh Green', hex: '#66ff44' },
  { name: 'Lime Green', hex: '#aaff44' },
  // Yellows/Oranges
  { name: 'Golden Yellow', hex: '#ffdd44' },
  { name: 'Sunset Orange', hex: '#ffaa44' },
  { name: 'Warm Orange', hex: '#ff7744' },
  // Reds/Pinks
  { name: 'Coral Red', hex: '#ff4444' },
  { name: 'Pink Rose', hex: '#ff4488' },
  // Browns
  { name: 'Brown Leather', hex: '#aa7744' },
  { name: 'Dark Brown', hex: '#885544' },
  // Grays
  { name: 'Slate Gray', hex: '#556677' },
  { name: 'Charcoal Gray', hex: '#667788' },
]
const typographyOptions = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingStyle: 'font-sans',
    bodyStyle: 'font-sans',
  },
  {
    id: 'classic',
    name: 'Classic',
    headingFont: 'Source Sans Pro',
    bodyFont: 'Crimson Text',
    headingStyle: 'font-sans',
    bodyStyle: 'font-serif',
  },
  {
    id: 'modern',
    name: 'Modern',
    headingFont: 'Satoshi',
    bodyFont: 'IBM Plex Sans',
    headingStyle: 'font-sans',
    bodyStyle: 'font-sans',
  },
]

// Opções específicas para template ATS
const atsTypographyOptions = [
  {
    id: 'minimalist',
    name: 'Sans-Serif',
    headingFont: 'Helvetica',
    bodyFont: 'Helvetica',
    headingStyle: 'font-sans',
    bodyStyle: 'font-sans',
  },
  {
    id: 'classic',
    name: 'Serif',
    headingFont: 'Times New Roman',
    bodyFont: 'Times New Roman',
    headingStyle: 'font-serif',
    bodyStyle: 'font-serif',
  },
]

// --- The Main Component ---
export function LayoutTabPanel({
  currentOptions,
  onOptionsChange,
}: LayoutTabPanelProps) {
  const handleOptionChange = <K extends keyof LayoutOptions>(
    key: K,
    value: LayoutOptions[K],
  ) => {
    onOptionsChange({
      ...currentOptions,
      [key]: value,
    })
  }

  // Escolhe as opções de tipografia baseado no template
  const getTypographyOptions = () => {
    return currentOptions.templateId === 'ats'
      ? atsTypographyOptions
      : typographyOptions
  }

  const currentTypographyOptions = getTypographyOptions()

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-8">
        {/* --- Template Section --- */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Template
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose your resume layout style
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative block cursor-pointer rounded-lg border-2 transition-all hover:bg-accent/50 ${
                  currentOptions.templateId === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted bg-background'
                }`}
                onClick={() =>
                  handleOptionChange(
                    'templateId',
                    template.id as LayoutOptions['templateId'],
                  )
                }
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-16 h-12 rounded border bg-muted/30 flex-shrink-0">
                    <TemplatePreview templateId={template.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {template.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* --- Styling Section --- */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Styling
            </h3>
            <p className="text-xs text-muted-foreground">
              Customize colors and typography
            </p>
          </div>
          <div className="space-y-5">
            <div className="space-y-5">
              <Label className="text-sm font-medium text-foreground">
                Accent Color
              </Label>
              <div className="grid grid-cols-6 gap-x-3 gap-y-4">
                <TooltipProvider>
                  {colorPalette.map((color) => (
                    <Tooltip key={color.name}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-10 h-10 rounded-full cursor-pointer transition-all hover:scale-110 ${
                            currentOptions.accentColor === color.hex
                              ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-110'
                              : 'hover:shadow-md'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() =>
                            handleOptionChange('accentColor', color.hex)
                          }
                        ></div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{color.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
            <div className="space-y-5 mt-8">
              <Label className="text-sm font-medium text-foreground">
                Typography
              </Label>
              <Select
                value={currentOptions.typography}
                onValueChange={(value: LayoutOptions['typography']) =>
                  handleOptionChange('typography', value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a font style">
                    {(() => {
                      const selected = currentTypographyOptions.find(
                        (f) => f.id === currentOptions.typography,
                      )
                      return selected ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${selected.headingStyle}`}
                          >
                            {selected.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selected.headingFont === selected.bodyFont
                              ? selected.headingFont
                              : `${selected.headingFont} & ${selected.bodyFont}`}
                          </span>
                        </div>
                      ) : null
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currentTypographyOptions.map((font) => (
                    <SelectItem key={font.id} value={font.id} className="h-12">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${font.headingStyle}`}
                        >
                          {font.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {font.headingFont === font.bodyFont
                            ? font.headingFont
                            : `${font.headingFont} & ${font.bodyFont}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* --- Sizing Section --- */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Sizing
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust text size for better readability
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Font Size
              </Label>
            </div>
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={[currentOptions.fontSize]}
                  onValueChange={(value) =>
                    handleOptionChange('fontSize', value[0])
                  }
                  min={-1}
                  max={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">Small</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">Large</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
