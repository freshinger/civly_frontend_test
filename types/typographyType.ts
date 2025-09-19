export type TypographyType = {
  id: number;
  name: string;
  headingFont: string;
  bodyFont: string;
  headingStyle: string;
  atsSupported: boolean;
};

export const TypographyRecord: Record<number, TypographyType> = {
  0: {
    id: 0,
    name: "Minimalist",
    headingFont: "Inter",
    bodyFont: "Inter",
    headingStyle: "font-sans",
    atsSupported: false,
  },
  1: {
    id: 1,
    name: "Classic",
    headingFont: "Playfair Display",
    bodyFont: "Source Sans Pro",
    headingStyle: "font-serif",
    atsSupported: false,
  },
  2: {
    id: 2,
    name: "Modern",
    headingFont: "Montserrat",
    bodyFont: "Open Sans",
    headingStyle: "font-sans font-medium",
    atsSupported: false,
  },
  3: {
    id: 3,
    name: "Sans Serif",
    headingFont: "Arial",
    bodyFont: "Arial",
    headingStyle: "font-sans",
    atsSupported: true,
  },
  4: {
    id: 4,
    name: "Serif",
    headingFont: "Times New Roman",
    bodyFont: "Times New Roman",
    headingStyle: "font-serif",
    atsSupported: true,
  },
};
