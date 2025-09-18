import { z } from "zod";

export const layoutConfigsSchema = z
  .object({
    templateId: z.number().int().nonnegative(),
    colorId: z.number().int().nonnegative(),
    fontSize: z.number().int(), // bounds elsewhere

    // New fields for layout-tab functionality
    templateType: z.enum(["modern", "classic", "ats"]).optional(),
    accentColor: z.string().optional(), // hex color like '#005eff'
    typography: z
      .enum(["minimalist", "classic", "modern", "serif", "sans-serif"])
      .optional(),
    fontSizeType: z.enum(["small", "medium", "large"]).optional(),
    // Note: For ATS templates, only 'serif' and 'sans-serif' typography options are available
    // For Modern/Classic templates: 'minimalist', 'classic', 'modern' options are available
  })
  .strict();

export type LayoutConfigs = z.infer<typeof layoutConfigsSchema>;
