import { CvData } from "@/schemas/cv_data_schema";

export const dummyCv: CvData = {
  id: "dummy",
  name: "Alice Müller",
  createdAt: new Date("2023-01-01T09:00:00Z").toISOString(),
  updatedAt: new Date("2023-06-15T12:30:00Z").toISOString(),
  userId: "user-123",
  visibility: "draft",
  password: undefined,

  layoutConfigs: {
    templateId: 2,
    colorId: 5,
    fontSize: 14,
  },

  personalInformation: {
    name: "Alice",
    surname: "Müller",
    profileUrl: "https://example.com/profile.jpg",
    birthdate: "1990-05-12T00:00:00.000Z",
    email: "alice.mueller@example.com",
    phone: "+49 170 1234567",
    location: "Berlin, Germany",
    linkedin: "https://linkedin.com/in/alice-mueller",
    xing: "https://www.xing.com/profile/Alice_Mueller",
    website: "https://alicedev.com",
    professionalTitle: "Full Stack Developer",
    summary:
      "Passionate developer with 8+ years of experience in building web applications. Specialized in React, Node.js, and TypeScript.",
  },

  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Tech Solutions GmbH",
      startDate: "2020-03-01T00:00:00.000Z",
      currentlyWorkingHere: true,
      location: "Hamburg, Germany",
      description:
        "Leading the frontend team, implementing design systems with React and TypeScript, and mentoring junior developers.",
    },
    {
      role: "Frontend Developer",
      company: "StartupX",
      startDate: "2017-06-01T00:00:00.000Z",
      endDate: "2020-02-28T00:00:00.000Z",
      currentlyWorkingHere: false,
      location: "Munich, Germany",
      description:
        "Built customer-facing web apps with Angular, optimized performance, and collaborated closely with UX designers.",
    },
  ],

  education: [
    {
      degree: "M.Sc. Computer Science",
      institution: "TU Berlin",
      startDate: "2014-10-01T00:00:00.000Z",
      endDate: "2017-04-01T00:00:00.000Z",
      currentlyStudyingHere: false,
      location: "Berlin, Germany",
      description: "Focus on distributed systems and machine learning.",
    },
    {
      degree: "B.Sc. Computer Science",
      institution: "University of Hamburg",
      startDate: "2011-10-01T00:00:00.000Z",
      endDate: "2014-07-01T00:00:00.000Z",
      currentlyStudyingHere: false,
      location: "Hamburg, Germany",
      description: "Graduated with honors.",
    },
  ],

  skillGroups: [
    {
      name: "Frontend",
      order: 1,
      skills: [
        { order: 1, name: "React" },
        { order: 2, name: "TypeScript" },
        { order: 3, name: "Tailwind CSS" },
      ],
    },
    {
      name: "Backend",
      order: 2,
      skills: [
        { order: 1, name: "Node.js" },
        { order: 2, name: "Express" },
        { order: 3, name: "MongoDB" },
      ],
    },
    {
      name: "Other",
      order: 3,
      skills: [
        { order: 1, name: "Git & GitHub" },
        { order: 2, name: "Agile / Scrum" },
      ],
    },
  ],
};
