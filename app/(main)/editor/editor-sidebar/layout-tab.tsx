'use client'

import React from 'react'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import type { CvData } from '@/schemas/cv_data_schema'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  SLIDER_TO_FONT_SIZE,
  FONT_SIZE_TO_SLIDER,
  type FontSizeType,
} from '@/constants/font-sizes'

// --- Type Definitions for Clarity ---
export interface LayoutOptions {
  templateId: 'modern' | 'classic' | 'ats'
  accentColor: string
  typography: 'minimalist' | 'classic' | 'modern' | 'serif' | 'sans-serif'
  fontSize: number
  fontSizeType: FontSizeType
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
    name: 'ATS-Friendly',
    description: 'Optimized for applicant tracking systems',
  },
]

const colorPalette = [
  // Blues (starting with primary)
  { name: 'Classic Blue', hex: '#005eff', isPrimary: true },
  { name: 'Sky Blue', hex: '#44aaff' },
  { name: 'Cyan Blue', hex: '#44ddff' },
  // Purples
  { name: 'Royal Purple', hex: '#6644ff' },
  { name: 'Deep Purple', hex: '#8844ff' },
  { name: 'Lavender', hex: '#aa88ff' },
  // Greens
  { name: 'Forest Green', hex: '#22aa44' },
  { name: 'Emerald', hex: '#44cc66' },
  { name: 'Mint Green', hex: '#66dd88' },
  // Reds
  { name: 'Crimson', hex: '#cc2244' },
  { name: 'Coral', hex: '#ff4466' },
  { name: 'Rose', hex: '#ff6688' },
  // Oranges
  { name: 'Burnt Orange', hex: '#dd6622' },
  { name: 'Tangerine', hex: '#ff8844' },
  { name: 'Peach', hex: '#ffaa66' },
  // Neutrals
  { name: 'Charcoal', hex: '#444444' },
  { name: 'Slate Gray', hex: '#666666' },
  { name: 'Stone Gray', hex: '#888888' },
]

// Typography options with font pairing
const typographyOptions = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingStyle: 'font-sans',
    atsSupported: false,
  },
  {
    id: 'classic',
    name: 'Classic',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
    headingStyle: 'font-serif',
    atsSupported: false,
  },
  {
    id: 'modern',
    name: 'Modern',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
    headingStyle: 'font-sans font-medium',
    atsSupported: false,
  },
]

// ATS-specific typography options (serif/sans-serif)
const atsTypographyOptions = [
  {
    id: 'sans-serif',
    name: 'Sans Serif',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    headingStyle: 'font-sans',
    atsSupported: true,
  },
  {
    id: 'serif',
    name: 'Serif',
    headingFont: 'Times New Roman',
    bodyFont: 'Times New Roman',
    headingStyle: 'font-serif',
    atsSupported: true,
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
    <div className="w-full h-full flex items-center justify-center bg-white rounded-sm border border-gray-300">
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

export function LayoutTabPanel() {
  const form = useFormContext<CvData>()

  // Template selection with FormField
  const TemplateField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.templateType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative h-20 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                      String(field.value) === template.id ||
                      (!field.value && template.id === 'modern')
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200'
                    }`}
                    onClick={() => field.onChange(template.id)}
                  >
                    <div className="flex items-center h-full">
                      <div className="w-24 h-full p-1">
                        <TemplatePreview templateId={template.id} />
                      </div>
                      <div className="flex-1 p-3">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  // Accent Color Field
  const AccentColorField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.accentColor"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="grid grid-cols-6 gap-x-3 gap-y-4">
                <TooltipProvider>
                  {colorPalette.map((color) => (
                    <Tooltip key={color.name}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-10 h-10 rounded-full cursor-pointer transition-all hover:scale-110 ${
                            String(field.value) === color.hex ||
                            (!field.value && color.hex === '#005eff')
                              ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-110'
                              : 'hover:shadow-md'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => field.onChange(color.hex)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{color.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  // Typography Field
  const TypographyField = () => {
    const currentTypographyOptions =
      form.watch('layoutConfigs.templateType') === 'ats'
        ? atsTypographyOptions
        : typographyOptions

    return (
      <FormField
        control={form.control}
        name="layoutConfigs.typography"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select
                value={field.value || 'minimalist'}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a font style">
                    {(() => {
                      const selected = currentTypographyOptions.find(
                        (f) => f.id === (field.value || 'minimalist'),
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
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  // Font Size Field
  const FontSizeField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.fontSizeType"
        render={({ field }) => {
          const currentSliderValue =
            FONT_SIZE_TO_SLIDER[field.value as FontSizeType] ?? 0

          return (
            <FormItem>
              <FormControl>
                <div className="space-y-3">
                  <div className="px-2">
                    <Slider
                      value={[currentSliderValue]}
                      onValueChange={(value) => {
                        const enumValue =
                          SLIDER_TO_FONT_SIZE[
                            value[0] as keyof typeof SLIDER_TO_FONT_SIZE
                          ]
                        field.onChange(enumValue)
                      }}
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="space-y-8">
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Template
              </Label>
              <p className="text-xs text-muted-foreground">
                Choose the foundation of your CV
              </p>
            </div>
            <TemplateField />
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Accent Color
            </Label>
            <AccentColorField />
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Typography
            </Label>
            <TypographyField />
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Font Size
            </Label>
            <FontSizeField />
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
