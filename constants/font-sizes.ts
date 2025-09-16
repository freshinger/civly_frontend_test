// Font size definitions for CV templates
// These values are optimized for CV readability and ATS compatibility

export const FONT_SIZE_MAPPING = {
  small: 10, // 10px - Compact, good for dense CVs
  medium: 11, // 11px - Standard CV font size (current default)
  large: 12, // 12px - More readable, good for senior positions
} as const

export type FontSizeType = keyof typeof FONT_SIZE_MAPPING

// Reverse mapping for slider position to enum conversion
export const SLIDER_TO_FONT_SIZE: Record<number, FontSizeType> = {
  [-1]: 'small',
  [0]: 'medium',
  [1]: 'large',
} as const

// Forward mapping for enum to slider position conversion
export const FONT_SIZE_TO_SLIDER: Record<FontSizeType, number> = {
  small: -1,
  medium: 0,
  large: 1,
} as const

// Helper function to get pixel value from enum
export function getFontSizePixels(sizeType: FontSizeType): number {
  return FONT_SIZE_MAPPING[sizeType]
}

// Helper function to get CSS font-size string
export function getFontSizeCSS(sizeType: FontSizeType): string {
  return `${FONT_SIZE_MAPPING[sizeType]}px`
}

// Helper function to convert fontSizeType to numeric fontSize for backwards compatibility
export function convertFontSizeTypeToNumber(
  fontSizeType?: FontSizeType,
): number {
  if (!fontSizeType) return FONT_SIZE_MAPPING.medium
  return FONT_SIZE_MAPPING[fontSizeType]
}

// Helper function to convert numeric fontSize to fontSizeType
export function convertNumberToFontSizeType(fontSize: number): FontSizeType {
  // Find the closest match
  if (fontSize <= 10) return 'small'
  if (fontSize >= 12) return 'large'
  return 'medium'
}
