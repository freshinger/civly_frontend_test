import z from "zod";
import { educationItemSchema } from "./education_schema";
import { experienceItemSchema } from "./experience_schema";
import { layoutConfigsSchema } from "./layout_schema";
import { personalInformationSchema } from "./personal_information_schema";
import { skillGroupSchema } from "./skills_schema";

export const cvDataSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  visibility: z.enum(["draft", "private", "public"]).optional(),
  password: z.string().optional(),
  // Subschemas
  layoutConfigs: layoutConfigsSchema.optional(),
  personalInformation: personalInformationSchema.optional(),
  experience: z.array(experienceItemSchema).optional(),
  education: z.array(educationItemSchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
});

export type CvData = z.infer<typeof cvDataSchema>;
