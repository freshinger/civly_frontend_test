export type TemplateType = {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
};

export const TemplateRecord: Record<number, TemplateType> = {
  0: {
    id: 0,
    name: "Modern",
    imageUrl: "/civly_modern-template.svg",
    description: "Clean and contemporary design",
  },
  1: {
    id: 1,
    name: "Classic",
    imageUrl: "/civly_classic-template.svg",
    description: "Traditional and professional",
  },
  2: {
    id: 2,
    name: "ATS-Friendly",
    imageUrl: "/civly_ats-template.svg",
    description: "Optimized for applicant tracking systems",
  },
};
