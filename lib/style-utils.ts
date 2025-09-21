import { ColorRecord } from "@/types/colorType";
import { TypographyRecord, TypographyType } from "@/types/typographyType";

// Font Size Mapping
export const FontSizeMapping = {
  10: {
    name: "Small",
    heading: {
      h1: "text-xl", // 20px
      h2: "text-lg", // 18px
      h3: "text-base", // 16px
      h4: "text-sm", // 14px
    },
    body: {
      base: "text-sm", // 14px
      small: "text-xs", // 12px
    },
  },
  11: {
    name: "Medium",
    heading: {
      h1: "text-2xl", // 24px
      h2: "text-xl", // 20px
      h3: "text-lg", // 18px
      h4: "text-base", // 16px
    },
    body: {
      base: "text-base", // 16px
      small: "text-sm", // 14px
    },
  },
  12: {
    name: "Large",
    heading: {
      h1: "text-3xl", // 30px
      h2: "text-2xl", // 24px
      h3: "text-xl", // 20px
      h4: "text-lg", // 18px
    },
    body: {
      base: "text-lg", // 18px
      small: "text-base", // 16px
    },
  },
} as const;

// Type for font size IDs
export type FontSizeId = keyof typeof FontSizeMapping;

// Utility functions
export const getColorById = (colorId: number) => {
  return ColorRecord[colorId];
};

export const getTypographyById = (fontId: number) => {
  return TypographyRecord[fontId];
};

export const getFontSizeById = (fontSizeId: FontSizeId) => {
  return FontSizeMapping[fontSizeId];
};

// Helper function to get body font class based on body font name
const getBodyFontClass = (typography: TypographyType) => {
  // For Classic style: body should be serif
  if (typography.name === "Classic") {
    return "font-serif";
  }

  const bodyFont = typography.bodyFont.toLowerCase();

  // Map specific fonts correctly
  if (
    bodyFont.includes("playfair") ||
    bodyFont.includes("times") ||
    bodyFont.includes("serif")
  ) {
    return "font-serif";
  } else {
    return "font-sans";
  }
};

// Helper function to get heading font class based on heading font name
const getHeadingFontClass = (typography: TypographyType) => {
  // For Classic style: headings should be sans
  if (typography.name === "Classic") {
    return "font-sans";
  }

  const headingFont = typography.headingFont.toLowerCase();

  // Map specific fonts correctly
  if (
    headingFont.includes("playfair") ||
    headingFont.includes("times") ||
    headingFont.includes("serif")
  ) {
    return "font-serif";
  } else {
    return "font-sans";
  }
};

// Utility to generate CSS classes for elements
export const getElementClasses = (
  elementType: "h1" | "h2" | "h3" | "h4" | "body" | "small",
  fontSizeId: FontSizeId,
  fontId: number,
  additionalClasses?: string
) => {
  const fontSizeConfig = getFontSizeById(fontSizeId);
  const typography = getTypographyById(fontId);

  let sizeClass = "";
  if (!fontSizeConfig || !typography) return sizeClass;
  if (elementType in fontSizeConfig?.heading) {
    sizeClass =
      fontSizeConfig?.heading[
        elementType as keyof typeof fontSizeConfig.heading
      ];
  } else if (elementType === "body") {
    sizeClass = fontSizeConfig?.body?.base;
  } else if (elementType === "small") {
    sizeClass = fontSizeConfig?.body?.small;
  }

  const fontFamilyClass = elementType.startsWith("h")
    ? getHeadingFontClass(typography)
    : getBodyFontClass(typography);

  const result = `${sizeClass} ${fontFamilyClass} ${
    additionalClasses || ""
  }`.trim();

  // Debug logging
  console.log("getElementClasses:", {
    elementType,
    fontSizeId,
    fontId,
    sizeClass,
    fontFamilyClass,
    typography: {
      name: typography?.name,
      headingFont: typography?.headingFont,
      bodyFont: typography?.bodyFont,
      headingStyle: typography?.headingStyle,
    },
    isHeading: elementType.startsWith("h"),
    result,
  });

  return result;
};

// Utility to get inline font styles for elements
export const getFontStyles = (
  elementType: "h1" | "h2" | "h3" | "h4" | "body" | "small",
  fontId: number
) => {
  const typography = getTypographyById(fontId);

  const isHeading = elementType.startsWith("h");
  const fontFamily = isHeading ? typography?.headingFont : typography?.bodyFont;

  // Map font names to CSS font families with fallbacks
  let cssFontFamily = "";
  const fontLower = fontFamily?.toLowerCase();

  if (fontLower.includes("inter")) {
    cssFontFamily = "Inter, ui-sans-serif, system-ui, sans-serif";
  } else if (fontLower.includes("playfair")) {
    cssFontFamily = '"Playfair Display", ui-serif, Georgia, serif';
  } else if (fontLower.includes("source sans")) {
    cssFontFamily = '"Source Sans Pro", ui-sans-serif, system-ui, sans-serif';
  } else if (fontLower.includes("montserrat")) {
    cssFontFamily = "Montserrat, ui-sans-serif, system-ui, sans-serif";
  } else if (fontLower.includes("open sans")) {
    cssFontFamily = '"Open Sans", ui-sans-serif, system-ui, sans-serif';
  } else if (fontLower.includes("arial")) {
    cssFontFamily = "Arial, ui-sans-serif, system-ui, sans-serif";
  } else if (fontLower.includes("times")) {
    cssFontFamily = '"Times New Roman", ui-serif, Times, serif';
  } else {
    // Fallback based on font type
    cssFontFamily = isHeading
      ? getHeadingFontClass(typography) === "font-serif"
        ? "ui-serif, Georgia, serif"
        : "ui-sans-serif, system-ui, sans-serif"
      : getBodyFontClass(typography) === "font-serif"
        ? "ui-serif, Georgia, serif"
        : "ui-sans-serif, system-ui, sans-serif";
  }

  return {
    fontFamily: cssFontFamily,
  };
};

// Utility to get accent color style
export const getAccentColorStyle = (colorId: number) => {
  const color = getColorById(colorId);
  return {
    color: color.hex,
    borderColor: color.hex,
    backgroundColor: color.hex,
  };
};

// Utility to get accent color classes for Tailwind
export const getAccentColorClasses = (
  colorId: number,
  type: "text" | "border" | "bg" = "text"
) => {
  const color = getColorById(colorId);

  // Since we have hex values, we'll use arbitrary values in Tailwind
  switch (type) {
    case "text":
      return `text-[${color.hex}]`;
    case "border":
      return `border-[${color.hex}]`;
    case "bg":
      return `bg-[${color.hex}]`;
    default:
      return `text-[${color.hex}]`;
  }
};
