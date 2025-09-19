import { CvData } from "@/schemas/cv_data_schema";

export const mockCvData: CvData = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Katrin Schmidt",
  updatedAt: "2025-09-05T10:30:00Z",
  createdAt: "2025-09-01T08:00:00Z",
  userId: "user_123456789",
  visibility: "public",

  layoutConfigs: {
    templateId: 0,
    colorId: 2,
    fontSizeId: 1,
    fontId: 0,
  },

  personalInformation: {
    name: "Katrin",
    surname: "Schmidt",
    profileUrl: "/katrin.jpg",
    birthdate: "1990-03-15",
    email: "katrin.schmidt@email.com",
    phone: "+49 030 123 4567",
    location: "Berlin, Germany",
    linkedin: "https://linkedin.com/in/katrinschmidt",
    website: "https://katrinschmidt.marketing",
    xing: "https://www.xing.com/profile/Katrin_Schmidt",
    professionalTitle: "Senior Marketing Manager",
    summary:
      "Results-driven Marketing Manager with 6+ years of experience in digital marketing and brand strategy. Specialized in growth marketing, and data-driven campaigns. Proven track record of increasing brand awareness and driving customer acquisition across B2B and B2C markets.",
  },

  experience: [
    {
      role: "Senior Marketing Manager",
      company: "TechFlow Solutions",
      startDate: "2022-01-01",
      currentlyWorkingHere: true,
      endDate: undefined,
      location: "Berlin",
      description:
        "Led integrated marketing campaigns that increased qualified leads by 85% and reduced customer acquisition cost by 30%. Managed annual marketing budget of €500K across digital and traditional channels. Developed and executed content marketing strategy resulting in 200% increase in organic website traffic. Built and managed a team of 4 marketing specialists, implementing data-driven processes that improved campaign ROI by 45%.",
    },
    {
      role: "Marketing Manager",
      company: "Digital Ventures GmbH",
      startDate: "2020-03-01",
      currentlyWorkingHere: false,
      endDate: "2021-12-31",
      location: "Munich",
      description:
        "Managed multi-channel marketing campaigns across email, social media, and paid advertising platforms. Achieved 40% increase in brand awareness through strategic partnerships and influencer collaborations. Implemented marketing automation workflows that improved lead nurturing efficiency by 60%. Conducted market research and competitive analysis to inform product positioning and pricing strategies.",
    },
    {
      role: "Digital Marketing Specialist",
      company: "Creative Agency Berlin",
      startDate: "2018-06-01",
      currentlyWorkingHere: false,
      endDate: "2020-02-28",
      location: "Berlin",
      description:
        "Executed digital marketing campaigns for B2B and B2C clients across various industries. Specialized in Google Ads, Facebook Ads, and LinkedIn advertising with average ROAS of 4.5x. Created and optimized landing pages and email campaigns that achieved industry-leading conversion rates. Collaborated with creative teams to develop compelling brand narratives and visual content.",
    },
  ],

  education: [
    {
      degree: "Master of Business Administration (MBA)",
      institution: "ESMT Berlin",
      startDate: "2016-09-01",
      currentlyStudyingHere: false,
      endDate: "2018-06-30",
      location: "Berlin",
      description: "Specialization in Digital Marketing and Entrepreneurship",
    },
    {
      degree: "Bachelor of Arts in Communication & Media Studies",
      institution: "Humboldt University Berlin",
      startDate: "2012-09-01",
      currentlyStudyingHere: false,
      endDate: "2016-06-30",
      location: "Berlin",
    },
  ],

  skillGroups: [
    {
      name: "Marketing Skills",
      order: 1,
      skills: [
        { order: 1, name: "Digital Marketing" },
        { order: 2, name: "Content Strategy" },
        { order: 3, name: "SEO/SEM" },
        { order: 4, name: "Social Media Marketing" },
        { order: 5, name: "Email Marketing" },
        { order: 6, name: "Marketing Automation" },
        { order: 7, name: "Brand Management" },
      ],
    },
    {
      name: "Analytics & Tools",
      order: 2,
      skills: [
        { order: 1, name: "Google Analytics" },
        { order: 2, name: "HubSpot" },
        { order: 3, name: "Salesforce" },
        { order: 4, name: "Mailchimp" },
        { order: 5, name: "Canva" },
      ],
    },
    {
      name: "Languages",
      order: 3,
      skills: [
        { order: 1, name: "German (Native)" },
        { order: 2, name: "English (Fluent)" },
        { order: 3, name: "Spanish (Conversational)" },
      ],
    },
  ],
};
