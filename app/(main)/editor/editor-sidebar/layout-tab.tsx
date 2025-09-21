"use client";

import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import type { CvData } from "@/schemas/cv_data_schema";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { TemplateRecord } from "@/types/templateType";
import { ColorRecord } from "@/types/colorType";
import { TypographyRecord } from "@/types/typographyType";

// Template visual representations using SVGs
const TemplatePreview = ({ templateId }: { templateId: number }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-sm border border-gray-300">
      <Image
        src={TemplateRecord[templateId].imageUrl}
        alt={`${templateId} template preview`}
        width={132}
        height={104}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export function LayoutTabPanel() {
  const form = useFormContext<CvData>();

  // Template selection with FormField
  const TemplateField = () => {
    const defaultValue = 0;
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.templateId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(TemplateRecord).map((template) => (
                  <div
                    key={template.id}
                    className={`relative h-18 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                      Number(field.value) === template.id ||
                      (!field.value && template.id === defaultValue)
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200"
                    }`}
                    onClick={() => field.onChange(template.id)}
                  >
                    <div className="flex items-center h-full p-1">
                      <div className="w-24 h-full p-1">
                        <TemplatePreview templateId={template.id} />
                      </div>
                      <div className="flex-1 p-3 ">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500">
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
    );
  };

  // Accent Color Field
  const AccentColorField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.colorId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex flex-wrap gap-x-3 gap-y-3">
                <TooltipProvider>
                  {Object.values(ColorRecord).map((color) => (
                    <Tooltip key={color.name}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110 ${
                            Number(field.value) === color.id ||
                            (!field.value && color.id === 0)
                              ? "ring-2 ring-primary ring-offset-2 shadow-lg scale-110"
                              : "hover:shadow-md"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => field.onChange(color.id)}
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
    );
  };

  const DEFAULT_FONT_ID = 0;

  const TypographyField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.fontId"
        render={({ field }) => {
          const selectedId = Number(field.value ?? DEFAULT_FONT_ID);
          const selected = TypographyRecord[selectedId];

          return (
            <FormItem>
              <FormControl>
                <Select
                  value={String(selectedId)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a font style">
                      {selected && (
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
                      )}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {Object.values(TypographyRecord).map((font) => (
                      <SelectItem
                        key={font.id}
                        value={String(font.id)}
                        className="h-12"
                      >
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
          );
        }}
      />
    );
  };

  // Font Size Field
  const FontSizeField = () => {
    return (
      <FormField
        control={form.control}
        name="layoutConfigs.fontSizeId"
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <div className="space-y-3">
                  <div className="px-2">
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => {
                        field.onChange(value[0]);
                      }}
                      min={10}
                      max={12}
                      step={1}
                      className="w-[200px]"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2 w-[220px]">
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
          );
        }}
      />
    );
  };

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
            <Label className="text-sm font-medium text-foreground pb-2">
              Font Size
            </Label>
            <FontSizeField />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
